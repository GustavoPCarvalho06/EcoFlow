import { logout } from "@/hooks/logout";
import { Button } from "../ui/button";

export default function ButtonLogout () {
    const handleLogout = async () => {
        await logout();
    };

    return(
        <Button onClick={handleLogout}>logout</Button>
    )
}