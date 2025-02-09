import { useEffect, useState } from "react";
import { getUserData } from "../api/api";

const fistTimeHook = () => {    
    const [isPasswordConfirmed, setIsPasswordConfirmed] = useState();
    const [root, setRoot] = useState("/password-confirmation");
    useEffect(() => {
        const isPasswordConfirmed = getUserData().user.password_confirmation;
        if (isPasswordConfirmed === "1") {
            setIsPasswordConfirmed(true);
        }
    }, []);
    return isPasswordConfirmed;
}

export default fistTimeHook;