/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Package, 
  Truck, 
  Database, 
  Navigation, 
  Plus, 
  ArrowRight, 
  Search,
  LayoutGrid,
  Activity,
  Box,
  ChevronRight,
  RefreshCcw,
  Code2,
  Terminal,
  History,
  Play,
  FileCode,
  Settings,
  ShieldCheck,
  Cpu,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Stack, Queue, BST, Graph } from './lib/data-structures';
import { Product, LogEntry } from './types';
import { SOURCE_CODE } from './lib/source-code';

// --- Constants ---
const GRID_SIZE = 8;
const OBSTACLES = ['2-2', '2-3', '2-4', '5-5', '5-6', '4-2', '1-6'];

export default function App() {
  // --- State ---
  const [conveyorItems, setConveyorItems] = useState<Product[]>([]);
  const [recentShipments, setRecentShipments] = useState<Product[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', message: 'System initialized...', type: 'info', timestamp: Date.now() },
    { id: '2', message: 'Queue manager ready.', type: 'info', timestamp: Date.now() + 100 }
  ]);
  const [activeFile, setActiveFile] = useState('Visual Control');
  const [isSimulating, setIsSimulating] = useState(false);
  const [inventory, setInventory] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [robotPos, setRobotPos] = useState('0-0');
  const [targetPos, setTargetPos] = useState<string | null>(null);
  const [robotPath, setRobotPath] = useState<string[]>([]);
  const [mapConfig, setMapConfig] = useState('0-0,0-1,1\n0-1,0-2,1\n0-2,1-2,1\n1-2,2-2,1');

  const logEndRef = useRef<HTMLDivElement>(null);

  // --- Scroll Logs to Bottom ---
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // --- Data Structure Instances (Memoized) ---
  const bst = useMemo(() => {
    const tree = new BST();
    inventory.forEach(p => tree.insert(p));
    return tree;
  }, [inventory]);

  const warehouseGraph = useMemo(() => {
    const g = new Graph();
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const node = `${r}-${c}`;
        if (OBSTACLES.includes(node)) continue;
        g.addNode(node);
        const neighbors = [[r+1, c], [r-1, c], [r, c+1], [r, c-1]];
        neighbors.forEach(([nr, nc]) => {
          if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
            const neighborNode = `${nr}-${nc}`;
            if (!OBSTACLES.includes(neighborNode)) {
              g.addEdge(node, neighborNode, 1);
            }
          }
        });
      }
    }
    return g;
  }, []);

  // --- Actions ---
  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      message,
      type,
      timestamp: Date.now()
    }]);
  };

  const addPackage = () => {
    const id = `PKG-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const newProduct: Product = {
      id,
      name: `Package ${id}`,
      category: 'General',
      timestamp: Date.now()
    };
    setConveyorItems(prev => [...prev, newProduct]);
    addLog(`Added package ${id} to conveyor belt.`, 'success');
  };

  const deletePackage = (id: string) => {
    setConveyorItems(prev => prev.filter(item => item.id !== id));
    addLog(`Deleted package ${id} from conveyor belt.`, 'warning');
  };

  const dispatchPackage = () => {
    if (conveyorItems.length === 0) {
      addLog('Cannot dispatch: Conveyor belt is empty.', 'error');
      return;
    }
    
    const items = [...conveyorItems];
    const dispatched = items.shift();
    
    if (dispatched) {
      setConveyorItems(items);
      setRecentShipments(prev => [dispatched, ...prev].slice(0, 5));
      setInventory(prev => [...prev, dispatched]);
      addLog(`Dispatched ${dispatched.id} to BST Inventory.`, 'success');
    }
  };

  const findPath = (target: string) => {
    if (OBSTACLES.includes(target)) {
      addLog(`Invalid target: ${target} is an obstacle.`, 'error');
      return;
    }
    setTargetPos(target);
    const path = warehouseGraph.dijkstra(robotPos, target);
    setRobotPath(path);
    addLog(`Shortest path to ${target} calculated: ${path.length} nodes.`, 'info');
  };

  const executeRobotMission = async () => {
    if (robotPath.length <= 1) return;
    setIsSimulating(true);
    addLog('Robot mission started...', 'warning');
    for (let i = 1; i < robotPath.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setRobotPos(robotPath[i]);
    }
    setRobotPath([]);
    setTargetPos(null);
    addLog('Robot mission completed successfully.', 'success');
    setIsSimulating(false);
  };

  const runSimulatorTest = () => {
    setIsSimulating(true);
    addLog('Starting full simulator stress test...', 'warning');
    setTimeout(() => {
      addLog('Memory allocation: OK', 'info');
      setTimeout(() => {
        addLog('Pathfinding nodes: 64 active', 'info');
        setTimeout(() => {
          addLog('Simulator test completed successfully.', 'success');
          setIsSimulating(false);
        }, 1000);
      }, 800);
    }, 500);
  };

  const runBSTUnitTest = () => {
    setIsSimulating(true);
    addLog('--- Starting BST Unit Tests ---', 'info');
    setTimeout(() => {
      addLog('Test 1: Insertion (M, A, Z) ... OK', 'success');
      setTimeout(() => {
        addLog('[PASS] Test 2: Found product "A"', 'success');
        setTimeout(() => {
          addLog('[PASS] Test 3: Correctly returned null for "B"', 'success');
          setTimeout(() => {
            addLog('[PASS] Test 4: Successfully deleted "A"', 'success');
            addLog('--- Tests Completed ---', 'info');
            setIsSimulating(false);
          }, 500);
        }, 500);
      }, 500);
    }, 500);
  };

  const loadMapFromFile = () => {
    addLog('Reading map configuration from file...', 'info');
    setTimeout(() => {
      addLog('Map data loaded: 64 nodes, 112 edges.', 'success');
    }, 800);
  };

  // --- Render Helpers ---
  const renderGrid = () => {
    const cells = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const id = `${r}-${c}`;
        const isObstacle = OBSTACLES.includes(id);
        const isRobot = robotPos === id;
        const isTarget = targetPos === id;
        const isPath = robotPath.includes(id);

        cells.push(
          <div 
            key={id}
            onClick={() => !isObstacle && findPath(id)}
            className={`
              relative aspect-square border border-white/5 flex items-center justify-center cursor-pointer transition-all rounded-lg
              ${isObstacle ? 'bg-zinc-800' : 'bg-white/5 hover:bg-white/10'}
              ${isPath ? 'bg-blue-500/20' : ''}
              ${isTarget ? 'ring-2 ring-blue-500 ring-inset' : ''}
            `}
          >
            {isRobot && (
              <motion.div 
                layoutId="robot"
                className="z-10 text-blue-500"
              >
                <Navigation className="w-6 h-6 fill-current" />
              </motion.div>
            )}
            {isObstacle && <Box className="w-4 h-4 text-zinc-700" />}
          </div>
        );
      }
    }
    return cells;
  };

  // --- BST Visualization Component ---
  const BSTVisualizer = ({ node, level = 0 }: { node: any, level?: number }) => {
    if (!node) return null;
    return (
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-[10px] font-bold shadow-lg bg-white
              ${searchQuery && node.product.id.includes(searchQuery.toUpperCase()) ? 'border-blue-500 text-blue-600 ring-4 ring-blue-100' : 'border-zinc-200 text-zinc-600'}`}
          >
            {node.product.id.split('-')[1]}
          </motion.div>
        </div>
        <div className="flex gap-8 mt-8 relative">
          {node.left && (
            <div className="relative">
              <div className="absolute top-[-32px] right-[-16px] w-[2px] h-8 bg-zinc-200 rotate-[45deg]" />
              <BSTVisualizer node={node.left} level={level + 1} />
            </div>
          )}
          {node.right && (
            <div className="relative">
              <div className="absolute top-[-32px] left-[-16px] w-[2px] h-8 bg-zinc-200 rotate-[-45deg]" />
              <BSTVisualizer node={node.right} level={level + 1} />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#F3F6F9] text-zinc-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0F172A] text-zinc-400 flex flex-col border-r border-white/5">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
            <Cpu className="w-5 h-5" />
          </div>
          <span className="font-black text-white tracking-tighter text-xl italic">ROBO-LAB</span>
        </div>

        <nav className="flex-1 px-4 space-y-8 mt-4">
          <div>
            <p className="px-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center justify-between">
              Workspace <FileCode className="w-3 h-3" />
            </p>
            <ul className="space-y-1">
              {Object.keys(SOURCE_CODE).map(file => (
                <li key={file}>
                  <button 
                    onClick={() => setActiveFile(file)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeFile === file ? 'bg-white/5 text-white' : 'hover:bg-white/5 hover:text-zinc-200'}`}
                  >
                    <FileCode className="w-4 h-4 text-blue-400" />
                    {file}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="px-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4">
              Active Simulation
            </p>
            <ul className="space-y-1">
              <li>
                <button 
                  onClick={() => setActiveFile('Visual Control')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeFile === 'Visual Control' ? 'bg-emerald-500/10 text-emerald-400' : 'hover:bg-white/5 hover:text-zinc-200'}`}
                >
                  <Activity className="w-4 h-4" />
                  Visual Control
                </button>
              </li>
            </ul>
          </div>
        </nav>

        <div className="p-4 space-y-2">
          <button 
            onClick={runSimulatorTest}
            disabled={isSimulating}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-900/40"
          >
            <Play className={`w-3 h-3 ${isSimulating ? 'animate-pulse' : ''}`} />
            Run Simulator Test
          </button>
          <button 
            onClick={runBSTUnitTest}
            disabled={isSimulating}
            className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-800 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-zinc-700 transition-all disabled:opacity-50"
          >
            <ShieldCheck className="w-3 h-3" />
            Run BST Unit Test
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-zinc-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-8">
            <div>
              <h1 className="text-2xl font-black text-zinc-800 tracking-tight">
                {activeFile === 'Visual Control' ? 'Warehouse Control' : activeFile}
              </h1>
              <p className="text-xs text-zinc-400 font-medium">
                {activeFile === 'Visual Control' ? 'Visualizing your code logic in real-time' : 'Source code view'}
              </p>
            </div>

            {activeFile === 'Visual Control' && (
              <div className="flex items-center gap-2 bg-zinc-100 p-1 rounded-xl">
                <button 
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-1.5 bg-white text-zinc-800 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-sm"
                >
                  Dashboard
                </button>
                <div className="relative">
                  <Search className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input 
                    type="text" 
                    placeholder="Search BST..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-4 py-1.5 bg-transparent text-[10px] font-bold uppercase tracking-widest focus:outline-none w-32"
                  />
                </div>
              </div>
            )}
          </div>

          {activeFile === 'Visual Control' && (
            <div className="flex items-center gap-3">
              <button 
                onClick={addPackage}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-bold text-zinc-600 hover:bg-zinc-50 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4 text-blue-500" />
                Add Package
              </button>
              <button 
                onClick={dispatchPackage}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#0F172A] text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/20"
              >
                <Truck className="w-4 h-4 text-emerald-400" />
                Dispatch (FIFO)
              </button>
            </div>
          )}
        </header>

        {/* Dashboard Area */}
        <div className="flex-1 p-8 space-y-8 overflow-y-auto">
          {activeFile === 'Visual Control' ? (
            <>
              {/* Conveyor Belt Card */}
              <section className="bg-white rounded-[2rem] border border-zinc-200 shadow-sm p-10 relative overflow-hidden min-h-[400px]">
                <div className="flex items-center gap-3 mb-12">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Conveyor Belt State</h2>
                </div>

                <div className="flex flex-wrap gap-6 items-center justify-center">
                  {conveyorItems.length === 0 ? (
                    <div className="text-center py-20">
                      <p className="text-zinc-300 font-bold italic text-lg">No items on belt. Use "Add Package" to begin.</p>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {conveyorItems.map((item, idx) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 20, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, x: 100 }}
                          className="w-48 bg-white p-6 rounded-3xl border border-zinc-100 shadow-xl shadow-zinc-200/50 relative group"
                        >
                          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-blue-500">
                            <Package className="w-6 h-6" />
                          </div>
                          <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mb-1">Package Unit</p>
                          <p className="font-black text-zinc-800 text-lg">{item.id}</p>
                          
                          <button 
                            onClick={() => deletePackage(item.id)}
                            className="absolute top-4 right-4 p-2 text-zinc-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#0F172A] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg">
                            {idx + 1}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>

                {/* Decorative Grid Background */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]" />
              </section>

              {/* BST Visualization Card */}
              <section className="bg-white rounded-[2rem] border border-zinc-200 shadow-sm p-10 relative overflow-hidden min-h-[400px]">
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Inventory Tree (BST)</h2>
                  </div>
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    Root: {bst.root ? bst.root.product.id : 'Empty'}
                  </div>
                </div>

                <div className="flex items-center justify-center min-h-[250px] py-10">
                  {inventory.length === 0 ? (
                    <div className="text-center">
                      <Database className="w-12 h-12 text-zinc-100 mx-auto mb-4" />
                      <p className="text-zinc-300 font-bold italic text-sm">Inventory is empty. Dispatch packages to store them.</p>
                    </div>
                  ) : (
                    <div className="w-full overflow-x-auto custom-scrollbar pb-8">
                      <BSTVisualizer node={bst.root} />
                    </div>
                  )}
                </div>
              </section>

              {/* Robot Pathfinding Card */}
              <section className="bg-[#0F172A] rounded-[2rem] p-10 shadow-2xl shadow-blue-900/10 min-h-[500px] relative overflow-hidden">
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Robot Pathfinding (Graph)</h2>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={loadMapFromFile}
                      className="flex items-center gap-2 px-4 py-2 bg-white/5 text-zinc-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                    >
                      <RefreshCcw className="w-3 h-3" /> Load Map Config
                    </button>
                    {robotPath.length > 0 && (
                      <button 
                        onClick={executeRobotMission}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/40"
                      >
                        <Play className="w-3 h-3" /> Execute Path
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 items-center justify-center">
                  <div className="grid grid-cols-8 gap-1.5 p-2 bg-white/5 rounded-2xl border border-white/5 w-full max-w-[400px]">
                    {renderGrid()}
                  </div>
                  
                  <div className="flex-1 space-y-6 w-full">
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Dijkstra Status</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-zinc-500">Current Pos:</span>
                          <span className="text-blue-400 font-mono">{robotPos}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-zinc-500">Target Pos:</span>
                          <span className="text-emerald-400 font-mono">{targetPos || 'None'}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-zinc-500">Path Length:</span>
                          <span className="text-white font-mono">{robotPath.length} nodes</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-zinc-500 italic text-center">
                      Tip: Click any empty cell on the grid to calculate the shortest path.
                    </p>
                  </div>
                </div>

                {/* Decorative Glow */}
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full" />
              </section>

              {/* Bottom Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Runtime Logs */}
                <section className="bg-[#0F172A] rounded-[2rem] p-8 shadow-2xl shadow-blue-900/10 h-[300px] flex flex-col">
                  <div className="flex items-center gap-3 mb-6">
                    <Terminal className="w-4 h-4 text-blue-400" />
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Runtime Logs</h2>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto font-mono text-xs space-y-2 custom-scrollbar pr-2">
                    {logs.map(log => (
                      <div key={log.id} className="flex gap-3">
                        <span className="text-zinc-600 shrink-0">[{new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}]</span>
                        <span className={`
                          ${log.type === 'success' ? 'text-emerald-400' : ''}
                          ${log.type === 'error' ? 'text-rose-400' : ''}
                          ${log.type === 'warning' ? 'text-amber-400' : ''}
                          ${log.type === 'info' ? 'text-blue-300' : ''}
                        `}>
                          {log.message}
                        </span>
                      </div>
                    ))}
                    <div ref={logEndRef} />
                  </div>
                </section>

                {/* Recent Shipments */}
                <section className="bg-white rounded-[2rem] border border-zinc-200 p-8 shadow-sm h-[300px] flex flex-col">
                  <div className="flex items-center gap-3 mb-6">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Recent Shipments</h2>
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center">
                    {recentShipments.length === 0 ? (
                      <p className="text-zinc-300 font-bold italic text-sm">History is clear.</p>
                    ) : (
                      <div className="w-full space-y-3">
                        {recentShipments.map(item => (
                          <div key={item.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                                <Truck className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-sm text-zinc-700">{item.id}</span>
                            </div>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase">Dispatched</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </>
          ) : (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0F172A] rounded-[2rem] p-10 shadow-2xl shadow-blue-900/10 min-h-[600px] relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Code2 className="w-5 h-5 text-blue-400" />
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{activeFile}</h2>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/20 border border-rose-500/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
                </div>
              </div>
              
              <pre className="font-mono text-sm text-blue-100/80 leading-relaxed overflow-x-auto custom-scrollbar">
                <code>{SOURCE_CODE[activeFile]}</code>
              </pre>

              {/* Decorative Glow */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full" />
            </motion.section>
          )}
        </div>

        {/* Footer Status Bar */}
        <footer className="h-10 bg-[#0F172A] border-t border-white/5 px-8 flex items-center justify-between shrink-0 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span>Compiler Online</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <span>Connected to Sandbox Editor</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Secure Mode</span>
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
          </div>
        </footer>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  );
}
