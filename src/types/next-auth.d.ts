import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    role: string;
    storeId: string | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: string;
      storeId: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    storeId: string | null;
  }
}
