import {MigrationInterface, QueryRunner} from "typeorm";

export class UserProfile1608927401208 implements MigrationInterface {
    name = 'UserProfile1608927401208'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `user_profile` (`id` varchar(36) NOT NULL, `fullName` varchar(255) NOT NULL, `age` int NOT NULL, `gender` enum ('male', 'female') NOT NULL DEFAULT 'male', PRIMARY KEY (`id`)) ENGINE=InnoDB");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP TABLE `user_profile`");
    }

}
