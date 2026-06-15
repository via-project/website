import './App.css';
import { Outlet } from 'react-router-dom';
import Title from './Title';
import Footer from './Footer';

// Shared chrome for the section-based pages. Each page renders only its
// content; Title and Footer live here so they aren't repeated per page.
function Layout() {
  return (
    <div id="wrapper">
      <Title />
      <Outlet />
      <Footer />
    </div>
  );
}

export default Layout;
