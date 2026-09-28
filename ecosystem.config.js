module.exports = {
  apps: [
    {
      name: "restaurant-saas",
      script: "npm",
      args: "start",
      cwd: "/opt/restaurant-saas/current",
      env: {
        NODE_ENV: "production",
        PORT: 3002
      }
    }
  ]
}