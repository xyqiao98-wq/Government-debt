import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TabNavigation } from '@/components/TabNavigation';

function App() {
  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white">
      {/* Header */}
      <Header />

      {/* Main content with Tab Navigation */}
      <TabNavigation />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;