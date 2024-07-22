// Assuming you're using 'next-auth/react' for signing out
import { signOut } from "next-auth/react";
import { store } from "../store/configureStore";

// Modified logout function to accept router as a parameter
export default async function logout(router) {
  try {
    const loginType = store.getState().entities?.credentials?.login_type;
    if (loginType === "google") await signOut();
    store.dispatch({ type: "logout", payload: "" });
    router.push("/signin");
  } catch (error) {
    console.log({ error });
  }
}

export async function logoutFromReduxMiddleware(response) {
  try {
    if (response === 419) {
      const loginType = store.getState().entities?.credentials?.login_type;
      if (loginType === "google") await signOut();
      store.dispatch({ type: "logout", payload: "" });
      window.location.href = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/signin`;
    }
  } catch (error) {
    console.log({ error });
  }
}
