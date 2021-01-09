import {MigrationInterface, QueryRunner} from "typeorm";

export class UserItemsRemoveQtd1610175822921 implements MigrationInterface {
    name = 'UserItemsRemoveQtd1610175822921'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `item` DROP COLUMN `qtd`");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `item` ADD `qtd` int NOT NULL");
    }

}
