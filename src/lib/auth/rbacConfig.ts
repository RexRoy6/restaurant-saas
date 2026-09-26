import { UserRole } from "@/db/schema"


//es para controlar los accesos del back
export type RbacRoute = {
  pattern: string
  methods: Partial<Record<string, UserRole[]>>
}

export const RBAC_CONFIG: RbacRoute[] = [
    {
 pattern: "/api/admin.*",
  methods: {
    GET: ["admin"],
    POST: ["admin"],
    PATCH: ["admin"],
    DELETE: ["admin"],
    HEAD: ["admin"],      // ⭐ add
    OPTIONS: ["admin"]    // ⭐ add
  }
},
  {
    pattern: "/api/companies",
    methods: {
      GET: ["admin"],
      POST: ["admin"]
    }
  },

  {
    pattern: "/api/companies/:id",
    methods: {
      DELETE: ["admin"],
      PATCH: ["admin"]
    }
  },
  //rutas para negocios, solo puede modificar owner y ver admin
   {
    pattern: "/api/company.*",
    methods: {
      GET: ["admin","owner"],
      POST: ["owner"],
      PATCH: ["owner"],
      DELETE: ["owner"]
    }
  },
  {
  pattern: "/api/auth/change-password",
  methods: {
    PATCH: ["admin", "owner"]
  }
},
   {
    pattern: "/api/products.*",
    methods: {
      GET: ["owner"],
      POST: ["owner"],
      PATCH: ["owner"],
      DELETE: ["owner"]
    }
  },
  {
    pattern: "/api/categories.*",
    methods: {
      GET: ["owner"],
      POST: ["owner"],
      PATCH: ["owner"],
      DELETE: ["owner"]
    }
  },
]