# SNI API
This API was developed using Express with Routing-Controllers, Socket.IO (Socket-Controllers), TypeORM, MySQL and Docker. Its a containerized application, but the database relies on another container.

# Setting up
You'll need:
* Docker and docker-compose

Follow these steps:
1. Database.
	* Create a MySQL 8.1 (or latest) container with a 'sni' database on it
	* Make sure to create a .env file, based on .env.example and your DB values
2. API
	* Run `docker-compose up` and inspect the output.
	* If everything went fine, you can run it again, with a `-d` param.

# Final considerations
I wish I could make this project available, but my free GCP tier expired these days, and I couldn't set up a VPS from scratch - had problems with SSL and VM's specs (too expensive). You can find an example of this project [here](https://www.linkedin.com/feed/update/urn:li:activity:6755470132862058496/). You can also reach me through [LinkedIn](https://www.linkedin.com/in/nickojs/)!
