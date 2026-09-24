module.exports = {
  apps: [
    {
      name: "crmsandiasoft",
      script: "npm",
      args: "start",
      cwd: "/opt/crmsandiasoft/current",
      env: {
        NODE_ENV: "production",
        PORT: 3001
      }
    }
  ]
}