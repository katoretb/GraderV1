import Cookies from 'js-cookie';

export const usePerm = () => {
    return Cookies.get("role") === "2"
};