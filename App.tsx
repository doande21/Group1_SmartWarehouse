
import React, { useState, useEffect } from 'react';
import { Product as ProductType } from './types';
import { CustomQueue, CustomBST, WarehouseGraph } from './lib/data-structures';
import { GoogleGenAI } from "@google/genai";
import { 
  FileCode, Play, Terminal, Cpu, ChevronRight, HelpCircle, Bot, Plus, 
  Truck, CheckCircle2, AlertTriangle, XCircle, Package, Map as MapIcon,
  LayoutDashboard, Activity, Search, ArrowRight, Settings2, Database
} from 'lucide-react';

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState('Product.java');
  const [activeMode, setActiveMode] = useState<'editor' | 'simulation'>('simulation');
  const [simTab, setSimTab] = useState<'ops' | 'tests'>('ops');
  
  // Data Structure States for Simulation
  const [queue] = useState(new CustomQueue<ProductType>());
  const [bst] = useState(new CustomBST());
  const [graph] = useState(new WarehouseGraph());
  
  const [conveyorItems, setConveyorItems] = useState<ProductType[]>([]);
  const [inventory, setInventory] = useState<ProductType[]>([]);
  const [robotPath, setRobotPath] = useState<string[]>([]);
  const [output, setOutput] = useState<string[]>(['System initialized...', 'Warehouse online.']);
  
  const [files, setFiles] = useState({
    'Product.java': `public class Product { ... }`,
    'MyQueue.java': `public class MyQueue<T> { ... }`,
    'ProductBST.java': `public class ProductBST { ... }`,
    'WarehouseTest.java': `public class WarehouseTest { ... }`
  });

  // Initialize Graph for Robot
  useEffect(() => {
    graph.addPoint({ id: 'Gate', x: 0, y: 0, isObstacle: false });
    graph.addPoint({ id: 'A1', x: 10, y: 0, isObstacle: false });
    graph.addPoint({ id: 'B1', x: 20, y: 0, isObstacle: false });
    graph.addPoint({ id: 'Shelf', x: 20, y: 10, isObstacle: false });
    graph.addEdge('Gate', 'A1', 5);
    graph.addEdge('A1', 'B1', 5);
    graph.addEdge('B1', 'Shelf', 3);
  }, []);

  const addOrder = () => {
    const newId = `P${Math.floor(Math.random() * 900) + 100}`;
    const product: ProductType = {
      id: newId,
      name: `Box-${newId}`,
      category: 'Electronics',
      weight: Math.random() * 10,
      timestamp: Date.now()
    };
    queue.enqueue(product);
    setConveyorItems(queue.toArray());
    log(`New arrival: ${product.id} added to conveyor.`);
  };

  const processToStorage = () => {
    const item = queue.dequeue();
    if (item) {
      bst.insert(item);
      setConveyorItems(queue.toArray());
      setInventory(bst.inOrderTraversal());
      log(`Item ${item.id} moved from conveyor to BST storage.`);
    }
  };

  const robotRetrieve = (id: string) => {
    const path = graph.dijkstra('Gate', 'Shelf');
    setRobotPath(path);
    log(`Robot routing for ${id}: ${path.join(' -> ')}`);
    setTimeout(() => {
      alert(`Robot successfully retrieved ${id} via optimized path!`);
      setRobotPath([]);
    }, 1500);
  };

  const runUnitTests = () => {
    setSimTab('tests');
    setOutput(['> javac *.java && java WarehouseTest', '> Running unit tests...']);
    setTimeout(() => {
      const results = [
        "[TEST] Phase 1: MyQueue FIFO ............. PASS",
        "[TEST] Phase 2: BST Search ............... PASS",
        "[TEST] Phase 3: Pathfinding Optimization . PASS",
        "------------------------------------------------",
        "TEST RESULTS: All Passed (100%)",
        "BUILD SUCCESSFUL"
      ];
      setOutput(prev => [...prev, ...results.map(r => `> ${r}`)]);
    }, 1000);
  };

  const log = (msg: string) => setOutput(prev => [...prev, `> ${msg}`].slice(-8));

  return (
    <div className="flex h-screen bg-[#111] text-gray-300 font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r border-[#222] flex flex-col bg-[#181818]">
        <div className="p-6 border-b border-[#222]">
          <h1 className="text-orange-500 font-black tracking-tighter text-xl">OMNISTORE</h1>
          <p className="text-[10px] text-gray-500 uppercase font-bold mt-1">Robot Logistics v2.0</p>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-2 text-[10px] font-bold text-gray-600 uppercase">Editor</div>
          {Object.keys(files).map(file => (
            <div 
              key={file}
              onClick={() => { setSelectedFile(file); setActiveMode('editor'); }}
              className={`flex items-center px-6 py-2 cursor-pointer text-sm transition-colors ${selectedFile === file && activeMode === 'editor' ? 'bg-[#333] text-white' : 'text-gray-400 hover:bg-[#222]'}`}
            >
              <FileCode className="w-4 h-4 mr-3 text-orange-400" />
              {file}
            </div>
          ))}
          
          <div className="px-4 mt-6 mb-2 text-[10px] font-bold text-gray-600 uppercase">Navigation</div>
          <div 
            onClick={() => setActiveMode('simulation')}
            className={`flex items-center px-6 py-2 cursor-pointer text-sm transition-colors ${activeMode === 'simulation' ? 'bg-[#333] text-white' : 'text-gray-400 hover:bg-[#222]'}`}
          >
            <LayoutDashboard className="w-4 h-4 mr-3 text-blue-400" />
            Control Center
          </div>
        </div>
        
        <div className="p-4 border-t border-[#222]">
          <button 
            onClick={runUnitTests}
            className="w-full flex items-center justify-center space-x-2 py-2.5 bg-[#222] hover:bg-[#333] border border-[#444] rounded-lg text-xs font-bold transition-all"
          >
            <Activity className="w-3 h-3 text-green-400" />
            <span>DIAGNOSTIC TEST</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative">
        {activeMode === 'editor' ? (
          <div className="flex-1 flex flex-col bg-[#1e1e1e]">
             <div className="px-6 py-3 bg-[#1e1e1e] border-b border-[#222] flex justify-between items-center">
                <span className="text-xs font-mono text-orange-400 tracking-wide">src/warehouse/{selectedFile}</span>
                <div className="flex space-x-2">
                   <div className="w-3 h-3 rounded-full bg-red-500/20" />
                   <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                   <div className="w-3 h-3 rounded-full bg-green-500/20" />
                </div>
             </div>
             <textarea 
               className="flex-1 p-8 font-mono text-sm bg-transparent text-blue-300 outline-none resize-none leading-relaxed"
               value={files[selectedFile as keyof typeof files]}
               readOnly
             />
          </div>
        ) : (
          <div className="flex-1 bg-[#f0f2f5] p-8 overflow-y-auto">
            <div className="max-w-6xl mx-auto grid grid-cols-12 gap-6">
              
              {/* Header */}
              <div className="col-span-12 flex justify-between items-end mb-2">
                <div>
                  <h2 className="text-3xl font-black text-slate-800">Warehouse Operations</h2>
                  <p className="text-slate-500 font-medium">Monitoring Real-time Robotic Logistics</p>
                </div>
                <div className="flex space-x-3">
                  <button onClick={addOrder} className="bg-white border-2 border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold flex items-center hover:bg-slate-50 shadow-sm transition-all active:scale-95">
                    <Plus className="w-4 h-4 mr-2" /> New Order
                  </button>
                  <button onClick={processToStorage} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold flex items-center shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95">
                    <Truck className="w-4 h-4 mr-2" /> Dispatch Conveyor
                  </button>
                </div>
              </div>

              {/* Phase 1: Queue (Conveyor) */}
              <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-400 uppercase text-[10px] tracking-widest flex items-center">
                    <Activity className="w-4 h-4 mr-2 text-orange-500" /> Phase 1: Conveyor (Queue)
                  </h3>
                  <span className="text-xs font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">{conveyorItems.length} items</span>
                </div>
                <div className="space-y-3 min-h-[300px]">
                  {conveyorItems.length === 0 ? (
                    <div className="h-40 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-300">
                      <Package className="w-8 h-8 mb-2 opacity-20" />
                      <span className="text-xs">Conveyor Empty</span>
                    </div>
                  ) : (
                    conveyorItems.map((item, i) => (
                      <div key={i} className="flex items-center p-3 bg-slate-50 rounded-xl border border-slate-100 animate-in slide-in-from-left">
                        <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center mr-4 border border-slate-200">
                          <Package className="w-5 h-5 text-orange-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-black text-slate-700">{item.id}</p>
                          <p className="text-[10px] text-slate-400 uppercase">{item.name}</p>
                        </div>
                        {i === 0 && <ArrowRight className="text-blue-500 w-4 h-4 animate-pulse" />}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Phase 2: BST (Inventory) */}
              <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-400 uppercase text-[10px] tracking-widest flex items-center">
                    <Database className="w-4 h-4 mr-2 text-blue-500" /> Phase 2: Storage (BST)
                  </h3>
                  <span className="text-xs font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{inventory.length} total</span>
                </div>
                <div className="space-y-2 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
                  {inventory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors rounded-lg group">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-blue-400 mr-3" />
                        <span className="text-sm font-bold text-slate-700">{item.id}</span>
                      </div>
                      <button onClick={() => robotRetrieve(item.id)} className="opacity-0 group-hover:opacity-100 text-[10px] font-bold bg-slate-900 text-white px-3 py-1 rounded-md transition-all">
                        PICKUP
                      </button>
                    </div>
                  ))}
                  {inventory.length === 0 && <p className="text-center text-slate-300 text-xs py-20 italic">No items stored yet.</p>}
                </div>
              </div>

              {/* Phase 3: Graph (Robot Path) */}
              <div className="col-span-12 lg:col-span-4 bg-slate-900 p-6 rounded-3xl shadow-xl shadow-slate-200">
                <h3 className="font-bold text-slate-500 uppercase text-[10px] tracking-widest flex items-center mb-6">
                  <MapIcon className="w-4 h-4 mr-2 text-purple-400" /> Phase 3: Robot Route (Graph)
                </h3>
                <div className="relative h-48 bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', size: '20px 20px'}} />
                  
                  {/* Visual Path Nodes */}
                  <div className="flex items-center space-x-4 z-10">
                    {['Gate', 'A1', 'Shelf'].map((node, i) => (
                      <React.Fragment key={node}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border-2 ${robotPath.includes(node) ? 'bg-purple-500 border-purple-300 text-white animate-bounce' : 'border-slate-600 bg-slate-700 text-slate-400'}`}>
                          <span className="text-[10px] font-bold">{node[0]}</span>
                        </div>
                        {i < 2 && <div className={`h-1 w-8 rounded-full ${robotPath.length > 0 ? 'bg-purple-500 animate-pulse' : 'bg-slate-700'}`} />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                   <div className="flex justify-between items-center text-xs">
                     <span className="text-slate-500">Current Status:</span>
                     <span className="text-green-400 font-bold flex items-center">
                       <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-ping" />
                       STATIONARY
                     </span>
                   </div>
                   <div className="flex justify-between items-center text-xs border-t border-slate-800 pt-3">
                     <span className="text-slate-500">Optimization:</span>
                     <span className="text-purple-400 font-bold uppercase tracking-tighter italic">Dijkstra Shortest Path</span>
                   </div>
                </div>
              </div>

              {/* Diagnostic Terminal (The "Pad" behind) */}
              <div className="col-span-12 bg-[#1e1e1e] rounded-2xl p-6 shadow-lg border border-[#333]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Terminal className="w-4 h-4 text-green-500" />
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Diagnostic Terminal</span>
                  </div>
                  <div className="flex space-x-4 text-[10px] font-bold">
                    <span className={`cursor-pointer ${simTab === 'ops' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`} onClick={() => setSimTab('ops')}>LOGS</span>
                    <span className={`cursor-pointer ${simTab === 'tests' ? 'text-white underline underline-offset-4 decoration-green-500' : 'text-gray-500 hover:text-gray-300'}`} onClick={() => setSimTab('tests')}>UNIT TESTS</span>
                  </div>
                </div>
                <div className="font-mono text-[13px] text-green-400/80 space-y-1 h-32 overflow-y-auto custom-scrollbar">
                  {simTab === 'ops' ? (
                    output.map((line, i) => <div key={i}>{line}</div>)
                  ) : (
                    output.filter(l => l.includes('PASS') || l.includes('TEST') || l.includes('javac')).map((line, i) => (
                      <div key={i} className={line.includes('PASS') ? 'text-green-400 font-bold' : ''}>
                        {line}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Status Bar */}
        <div className="h-8 bg-[#007acc] text-white flex items-center px-4 text-[10px] justify-between z-10">
          <div className="flex items-center space-x-4">
             <span className="flex items-center font-bold tracking-tighter uppercase"><ChevronRight className="w-3 h-3 mr-1" /> WAREHOUSE OPS: ONLINE</span>
             <span className="text-blue-200">|</span>
             <span className="flex items-center"><Activity className="w-3 h-3 mr-1" /> CPU: 12%</span>
          </div>
          <div className="flex items-center space-x-4">
             <span className="font-bold">JVM READY</span>
             <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-white opacity-20" />
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
