import {MigrationInterface, QueryRunner} from "typeorm";

export class UserItems1610005746945 implements MigrationInterface {
    name = 'UserItems1610005746945'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `item` (`id` int NOT NULL AUTO_INCREMENT, `OSRSId` varchar(255) NOT NULL, `qtd` int NOT NULL, `userId` varchar(36) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `item` ADD CONSTRAINT `FK_5369db3bd33839fd3b0dd5525d1` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `item` DROP FOREIGN KEY `FK_5369db3bd33839fd3b0dd5525d1`");
        await queryRunner.query("DROP TABLE `item`");
    }

}
