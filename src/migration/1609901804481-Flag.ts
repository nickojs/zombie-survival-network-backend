import {MigrationInterface, QueryRunner} from "typeorm";

export class Flag1609901804481 implements MigrationInterface {
    name = 'Flag1609901804481'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `IDX_93e37a8413a5745a9b52bc3c0c` ON `user`");
        await queryRunner.query("CREATE TABLE `flag` (`id` int NOT NULL AUTO_INCREMENT, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `userId` varchar(36) NULL, `flaggedById` varchar(36) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `user_location` DROP COLUMN `latitude`");
        await queryRunner.query("ALTER TABLE `user_location` ADD `latitude` int NOT NULL");
        await queryRunner.query("ALTER TABLE `user_location` DROP COLUMN `longitude`");
        await queryRunner.query("ALTER TABLE `user_location` ADD `longitude` int NOT NULL");
        await queryRunner.query("ALTER TABLE `flag` ADD CONSTRAINT `FK_98b6d256a3efd63c9be7f381312` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `flag` ADD CONSTRAINT `FK_22691d0f89ed62af7453ef35908` FOREIGN KEY (`flaggedById`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `flag` DROP FOREIGN KEY `FK_22691d0f89ed62af7453ef35908`");
        await queryRunner.query("ALTER TABLE `flag` DROP FOREIGN KEY `FK_98b6d256a3efd63c9be7f381312`");
        await queryRunner.query("ALTER TABLE `user_location` DROP COLUMN `longitude`");
        await queryRunner.query("ALTER TABLE `user_location` ADD `longitude` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `user_location` DROP COLUMN `latitude`");
        await queryRunner.query("ALTER TABLE `user_location` ADD `latitude` varchar(255) NOT NULL");
        await queryRunner.query("DROP TABLE `flag`");
        await queryRunner.query("CREATE UNIQUE INDEX `IDX_93e37a8413a5745a9b52bc3c0c` ON `user` (`locationId`)");
    }

}
