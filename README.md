# sample_site

To start the site:
1. `npm install package.json`
2. `node index.js`
3. In your favorite web browser, visit the site at `localhost:3000`

I have also included a dockerfile and "docker-ized" the webapp. Here are
the steps to get that up and running:
1. `docker build -t sample-site-app .` - Verify this worked correctly by doing
   `docker images`. You should see `sample-site-app` listed.
2. `docker run -p 49160:3000 -d sample-site-app` - Verify this worked correctly
   by doing `docker ps`. You should see the container. 
3. In your favorite web browser, visit the site at `localhost:49160`.

To run tests:
1. ensure the web app is up and running and then run the command `npm test`. 
