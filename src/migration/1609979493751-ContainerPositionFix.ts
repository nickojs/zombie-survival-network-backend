import {MigrationInterface, QueryRunner} from "typeorm";

export class ContainerPositionFix1609979493751 implements MigrationInterface {
    name = 'ContainerPositionFix1609979493751'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `IDX_04806badf354a677ec1625b19a` ON `user`");
        await queryRunner.query("ALTER TABLE `container_position` DROP COLUMN `position`");
        await queryRunner.query("ALTER TABLE `container_position` ADD `position` mediumtext NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `container_position` DROP COLUMN `position`");
        await queryRunner.query("ALTER TABLE `container_position` ADD `position` varchar(255) NOT NULL");
        await queryRunner.query("CREATE UNIQUE INDEX `IDX_04806badf354a677ec1625b19a` ON `user` (`containersId`)");
    }

}
