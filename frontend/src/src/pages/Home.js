import HomeST from '../pages/ST/Home';
import HomePF from '../pages/PF/Home';
import Cookies from 'js-cookie';

function Home(){
    if(Cookies.get("role") !== "2"){
        return <HomeST />
    }else{
        return <HomePF />
    }
}

export default Home;