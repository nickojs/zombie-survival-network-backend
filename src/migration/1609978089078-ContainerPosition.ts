import {MigrationInterface, QueryRunner} from "typeorm";

export class ContainerPosition1609978089078 implements MigrationInterface {
    name = 'ContainerPosition1609978089078'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `container_position` (`id` int NOT NULL AUTO_INCREMENT, `position` varchar(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `user` ADD `containersId` int NULL");
        await queryRunner.query("ALTER TABLE `user` ADD UNIQUE INDEX `IDX_04806badf354a677ec1625b19a` (`containersId`)");
        await queryRunner.query("CREATE UNIQUE INDEX `REL_04806badf354a677ec1625b19a` ON `user` (`containersId`)");
        await queryRunner.query("ALTER TABLE `user` ADD CONSTRAINT `FK_04806badf354a677ec1625b19a6` FOREIGN KEY (`containersId`) REFERENCES `container_position`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` DROP FOREIGN KEY `FK_04806badf354a677ec1625b19a6`");
        await queryRunner.query("DROP INDEX `REL_04806badf354a677ec1625b19a` ON `user`");
        await queryRunner.query("ALTER TABLE `user` DROP INDEX `IDX_04806badf354a677ec1625b19a`");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `containersId`");
        await queryRunner.query("DROP TABLE `container_position`");
    }

}
