import {MigrationInterface, QueryRunner} from "typeorm";

export class UserProfileRelation1608928251659 implements MigrationInterface {
    name = 'UserProfileRelation1608928251659'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` ADD `profileId` varchar(36) NULL");
        await queryRunner.query("ALTER TABLE `user` ADD UNIQUE INDEX `IDX_9466682df91534dd95e4dbaa61` (`profileId`)");
        await queryRunner.query("CREATE UNIQUE INDEX `REL_9466682df91534dd95e4dbaa61` ON `user` (`profileId`)");
        await queryRunner.query("ALTER TABLE `user` ADD CONSTRAINT `FK_9466682df91534dd95e4dbaa616` FOREIGN KEY (`profileId`) REFERENCES `user_profile`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` DROP FOREIGN KEY `FK_9466682df91534dd95e4dbaa616`");
        await queryRunner.query("DROP INDEX `REL_9466682df91534dd95e4dbaa61` ON `user`");
        await queryRunner.query("ALTER TABLE `user` DROP INDEX `IDX_9466682df91534dd95e4dbaa61`");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `profileId`");
    }

}
