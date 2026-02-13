import { redirect } from "react-router";

export async function clientLoader() {
    return redirect("/dashboard");
}

export default function Home() {
    return null;
}
