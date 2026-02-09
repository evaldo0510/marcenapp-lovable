import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index'; // Seu painel administrativo
import ClientView from './pages/ClientView'; // <--- IMPORTAR

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        {/* ROTA MÁGICA DO CLIENTE 👇 */}
        <Route path="/projeto/:id" element={<ClientView />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
