import { test } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcrypt";

// Use an isolated database with the migrations applied. Never point this at production.
const database = process.env.ERP_TEST_DATABASE_URL;
test(
  "workspace: permissions, product pagination/edit and atomic sales",
  { skip: !database },
  async () => {
    process.env.DATABASE_URL = database;
    process.env.JWT_SECRET = "local-integration-test-only-secret";
    const { default: prisma } = await import("../src/config/prisma.js");
    const { default: app } = await import("../src/app.js");
    const server = app.listen(0, "127.0.0.1");
    await new Promise<void>((resolve) => server.once("listening", resolve));
    const address = server.address() as { port: number };
    const prefix = `test-${Date.now()}`;
    const ids: {
      role?: string;
      user?: string;
      category?: string;
      product?: string;
      permissions: string[];
    } = { permissions: [] };
    let token = "";
    async function request(
      path: string,
      method = "GET",
      body?: unknown,
      authorized = true,
    ) {
      const response = await fetch(
        `http://127.0.0.1:${address.port}/api${path}`,
        {
          method,
          headers: {
            "Content-Type": "application/json",
            ...(authorized && token
              ? { Authorization: `Bearer ${token}` }
              : {}),
          },
          body: body ? JSON.stringify(body) : undefined,
        },
      );
      return { status: response.status, body: await response.json() };
    }
    try {
      const role = await prisma.role.create({ data: { name: prefix } });
      ids.role = role.id;
      const user = await prisma.user.create({
        data: {
          name: "Teste",
          email: `${prefix}@example.test`,
          passwordHash: await bcrypt.hash("test-only-password", 4),
          roleId: role.id,
        },
      });
      ids.user = user.id;
      const login = await request(
        "/auth/login",
        "POST",
        { email: user.email, password: "test-only-password" },
        false,
      );
      assert.equal(login.status, 200);
      token = login.body.token;
      assert.deepEqual(login.body.user.permissions, []);
      assert.equal((await request("/products")).status, 403);
      assert.equal(
        (await request("/sales", "POST", { items: [] })).status,
        403,
      );
      assert.equal((await request("/sales")).status, 403);
      assert.equal(
        (await request("/auth/me", "GET", undefined, false)).status,
        401,
      );
      for (const name of [
        "products:read",
        "products:create",
        "products:update",
        "sales:create",
        "sales:read",
      ]) {
        let permission = await prisma.permission.findUnique({
          where: { name },
        });
        if (!permission) {
          permission = await prisma.permission.create({ data: { name } });
          ids.permissions.push(permission.id);
        }
        await prisma.rolePermission.create({
          data: { roleId: role.id, permissionId: permission.id },
        });
      }
      assert.ok(
        (await request("/auth/me")).body.permissions.includes(
          "products:update",
        ),
      );
      const category = await request("/products/categories", "POST", {
        name: prefix,
      });
      ids.category = category.body.id;
      const created = await request("/products", "POST", {
        sku: prefix,
        name: "Produto teste",
        categoryId: ids.category,
        price: 15.5,
        costPrice: 8,
        minStockAlert: 2,
      });
      assert.equal(created.status, 201);
      ids.product = created.body.id;
      assert.equal(
        (await request("/products", "POST", { name: "" })).status,
        400,
      );
      assert.equal((await request("/products?page=0")).status, 400);
      assert.equal(
        (await request("/products?page=1&pageSize=101")).status,
        400,
      );
      assert.ok(Array.isArray((await request("/products")).body));
      const page = await request(
        `/products?page=1&pageSize=1&search=${prefix}`,
      );
      assert.equal(page.body.total, 1);
      assert.equal(page.body.data.length, 1);
      assert.equal(
        (await request(`/products?page=1&sku=${prefix}`)).body.data[0].id,
        ids.product,
      );
      assert.equal(
        (await request(`/products/${ids.product}`, "PUT", { price: 20 }))
          .status,
        200,
      );
      assert.equal(
        Number(
          (await prisma.product.findUnique({ where: { id: ids.product } }))!
            .price,
        ),
        20,
      );
      assert.equal(
        await prisma.auditLog.count({
          where: { resourceId: ids.product, action: "PRODUCT_UPDATED" },
        }),
        1,
      );
      assert.equal(
        (await request("/products/invalid-id", "PUT", { price: 20 })).status,
        400,
      );
      await prisma.product.update({
        where: { id: ids.product },
        data: { stockQuantity: 3 },
      });
      const sale = await request("/sales", "POST", {
        items: [{ productId: ids.product, quantity: 2 }],
      });
      assert.equal(sale.status, 201);
      assert.equal(Number(sale.body.data.totalAmount), 40);
      assert.equal(
        (await prisma.product.findUnique({ where: { id: ids.product } }))!
          .stockQuantity,
        1,
      );
      assert.equal(
        (
          await request("/sales", "POST", {
            items: [{ productId: ids.product, quantity: 2 }],
          })
        ).status,
        400,
      );
      assert.equal(
        await prisma.sale.count({ where: { userId: user.id } }),
        1,
        "rejected sale must roll back",
      );
      assert.equal(
        (
          await request("/sales", "POST", {
            items: [
              { productId: ids.product, quantity: 1 },
              { productId: ids.product, quantity: 1 },
            ],
          })
        ).status,
        400,
      );
      await prisma.rolePermission.deleteMany({
        where: { roleId: role.id, permission: { name: "sales:create" } },
      });
      assert.equal(
        (
          await request("/sales", "POST", {
            items: [{ productId: ids.product, quantity: 1 }],
          })
        ).status,
        403,
        "old token must respect permission revocation",
      );
      await prisma.user.update({
        where: { id: user.id },
        data: { isActive: false },
      });
      assert.equal((await request("/auth/me")).status, 401);
    } finally {
      if (ids.user) {
        await prisma.auditLog.deleteMany({ where: { userId: ids.user } });
        await prisma.stockMovement.deleteMany({ where: { userId: ids.user } });
        await prisma.sale.deleteMany({ where: { userId: ids.user } });
      }
      if (ids.product)
        await prisma.product.delete({ where: { id: ids.product } });
      if (ids.category)
        await prisma.category.delete({ where: { id: ids.category } });
      if (ids.user) await prisma.user.delete({ where: { id: ids.user } });
      if (ids.role) {
        await prisma.rolePermission.deleteMany({ where: { roleId: ids.role } });
        await prisma.role.delete({ where: { id: ids.role } });
      }
      if (ids.permissions.length)
        await prisma.permission.deleteMany({
          where: { id: { in: ids.permissions } },
        });
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
      await prisma.$disconnect();
    }
  },
);
