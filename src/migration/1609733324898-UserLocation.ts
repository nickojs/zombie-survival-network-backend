import {MigrationInterface, QueryRunner} from "typeorm";

export class UserLocation1609733324898 implements MigrationInterface {
    name = 'UserLocation1609733324898'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `user_location` (`id` int NOT NULL AUTO_INCREMENT, `latitude` varchar(255) NOT NULL, `longitude` varchar(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `user` ADD `locationId` int NULL");
        await queryRunner.query("ALTER TABLE `user` ADD UNIQUE INDEX `IDX_93e37a8413a5745a9b52bc3c0c` (`locationId`)");
        await queryRunner.query("CREATE UNIQUE INDEX `REL_93e37a8413a5745a9b52bc3c0c` ON `user` (`locationId`)");
        await queryRunner.query("ALTER TABLE `user` ADD CONSTRAINT `FK_93e37a8413a5745a9b52bc3c0c1` FOREIGN KEY (`locationId`) REFERENCES `user_location`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` DROP FOREIGN KEY `FK_93e37a8413a5745a9b52bc3c0c1`");
        await queryRunner.query("DROP INDEX `REL_93e37a8413a5745a9b52bc3c0c` ON `user`");
        await queryRunner.query("ALTER TABLE `user` DROP INDEX `IDX_93e37a8413a5745a9b52bc3c0c`");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `locationId`");
        await queryRunner.query("DROP TABLE `user_location`");
    }

}
