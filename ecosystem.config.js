module.exports = {
  apps: [
    {
      name: "hospi-host-system",
      script: "npm",
      args: "start",
      cwd: "/opt/restaurant-saas/current",
      env: {
        NODE_ENV: "production",
        //ver si hay que cambiar de puerto estaba en 3001
        PORT: 3002
      }
    }
  ]
}