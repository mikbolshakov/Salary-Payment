import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('employees', (table) => {
    table.string('full_name', 255).notNullable();
    table.string('wallet_address', 255).notNullable().unique();
    table.decimal('salary').notNullable();
    table.decimal('bonus');
    table.decimal('penalty');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('employees');
}
