import { Routes, Route }    from 'react-router-dom'
import PrivateRoutes        from "./privateRoutes"
import PublicRoutes         from './publicRoutes'
import ProfRoutes           from './profRoutes'


// global
import Home         from '../pages/Home';
import ErrorComp    from '../pages/error';

// Professor
import ClassEdit    from '../pages/PF/ClassEdit';
import AssignList   from '../pages/PF/AssignList';
import AssignCreate from '../pages/PF/AssignCreate';
import AssignEdit   from '../pages/PF/AssignEdit';
import AssignSus    from '../pages/PF/AssignSus';
import Sentin       from '../pages/PF/Sentin';
import StudentList  from '../pages/PF/StudentList';
import TAmanage     from '../pages/PF/TAmanage';
import QRScan       from '../pages/PF/Scan';
import Checkio      from '../pages/PF/Checkio';
import DSC          from '../pages/PF/DirectScan';

// Student
import Class        from '../pages/ST/Class';
import Lab          from '../pages/ST/Lab';
import Portfolio    from '../pages/ST/Portfolio';

const isDev     = process.env.REACT_APP_DEV.toLowerCase() === 'true';
const Login     = isDev ? require('../test/test-login').default : require('../pages/Login').default;
const Callback  = isDev ? require('../test/test-callback').default : require('../pages/Callback').default;
const Logout    = isDev ? require('../test/test-logout').default : require('../pages/Logout').default;

function App() {
    return (
        <Routes>
            <Route element={<PrivateRoutes />}>
                <Route element={<ProfRoutes />}>
                    <Route element={<ClassEdit />} path='ClassEdit' />
                    <Route element={<AssignCreate />} path='AssignCreate' />
                    <Route element={<AssignEdit />} path='AssignEdit' />
                    <Route element={<AssignList />} path='AssignList' />
                    <Route element={<AssignSus />} path='AssignSus' />
                    <Route element={<TAmanage />} path='TAmanage' />
                    <Route element={<Sentin />} path='Sentin' />
                    <Route element={<StudentList />} path='StudentList' />
                    <Route element={<QRScan />} path='Scan' />
                    <Route element={<Checkio />} path='CheckInOut' />
                    <Route element={<DSC />} path='DSC/:id' />

                </Route>
                <Route element={<Home />} path='/' />
                <Route element={<Class />} path='Class' />
                <Route element={<Lab />} path='Lab' />
                <Route element={<Portfolio />} path='Portfolio' />
                <Route element={<Logout />} path='Logout' />
                
            </Route>
            <Route element={<PublicRoutes />}>
                <Route element={<Login />} path='login' />
                <Route element={<Callback />} path='callback' />
            </Route>
            <Route element={<ErrorComp />} path='*' />

        </Routes>
    )
}

export default App
