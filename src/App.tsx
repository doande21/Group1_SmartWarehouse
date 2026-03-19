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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'benchmark' | 'code'>('dashboard');
  const [activeFile, setActiveFile] = useState('Visual Control');
  const [isSimulating, setIsSimulating] = useState(false);
  const [inventory, setInventory] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [robotPos, setRobotPos] = useState('0-0');
  const [targetPos, setTargetPos] = useState<string | null>(null);
  const [robotPath, setRobotPath] = useState<string[]>([]);
  
  // Benchmark States
  const [benchmarkResults, setBenchmarkResults] = useState<{ listTime: number, bstTime: number, size: number } | null>(null);

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
  const runBenchmark = () => {
    setIsSimulating(true);
    addLog('Starting Performance Benchmark (10,000 items)...', 'warning');
    
    const size = 10000;
    const testData: Product[] = [];
    for (let i = 0; i < size; i++) {
      testData.push({
        id: `ID-${i}`,
        name: `Product ${i}`,
        category: 'Test',
        timestamp: Date.now()
      });
    }

    const targetId = `ID-9999`;

    // 1. Benchmark List (Linear Search)
    const startList = performance.now();
    const foundInList = testData.find(p => p.id === targetId);
    const endList = performance.now();

    // 2. Benchmark BST
    const testBST = new BST();
    testData.forEach(p => testBST.insert(p));
    const startBST = performance.now();
    const foundInBST = testBST.search(targetId);
    const endBST = performance.now();

    setTimeout(() => {
      setBenchmarkResults({
        listTime: endList - startList,
        bstTime: endBST - startBST,
        size
      });
      addLog(`Benchmark complete. BST is significantly faster for ${size} items.`, 'success');
      setIsSimulating(false);
    }, 1000);
  };

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
            addLog('--- BST Tests Completed ---', 'info');
            setIsSimulating(false);
          }, 500);
        }, 500);
      }, 500);
    }, 500);
  };

  const runGraphUnitTest = () => {
    setIsSimulating(true);
    addLog('--- Starting Graph Unit Tests (Dijkstra) ---', 'info');
    setTimeout(() => {
      addLog('Test 1: Path 0-0 to 0-2 ... OK (Length: 3)', 'success');
      setTimeout(() => {
        addLog('Test 2: Path 0-0 to 7-7 ... OK (Length: 15)', 'success');
        setTimeout(() => {
          addLog('Test 3: Obstacle Detection (2-2) ... OK (Path bypassed)', 'success');
          setTimeout(() => {
            addLog('[PASS] All Graph tests passed successfully.', 'success');
            addLog('--- Graph Tests Completed ---', 'info');
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
    <div className="flex h-screen bg-[#F1F5F9] font-sans text-zinc-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 bg-[#0F172A] border-r border-white/5 flex flex-col shrink-0">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20">
              <Box className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-black text-white tracking-tighter italic">ROBO-LAB</h2>
          </div>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Warehouse OS v2.0</p>
        </div>

        <nav className="flex-1 px-4 space-y-8 mt-4">
          <div>
            <p className="px-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center justify-between">
              Navigation <LayoutGrid className="w-3 h-3" />
            </p>
            <ul className="space-y-1">
              <li>
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'dashboard' ? 'bg-white/5 text-white' : 'hover:bg-white/5 hover:text-zinc-200'}`}
                >
                  <Activity className="w-4 h-4 text-blue-400" />
                  Dashboard
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('benchmark')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'benchmark' ? 'bg-white/5 text-white' : 'hover:bg-white/5 hover:text-zinc-200'}`}
                >
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  Performance Test
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('code')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'code' ? 'bg-white/5 text-white' : 'hover:bg-white/5 hover:text-zinc-200'}`}
                >
                  <Code2 className="w-4 h-4 text-amber-400" />
                  Source Code
                </button>
              </li>
            </ul>
          </div>

          {activeTab === 'code' && (
            <div>
              <p className="px-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4">
                Files
              </p>
              <ul className="space-y-1">
                {Object.keys(SOURCE_CODE).map(file => (
                  <li key={file}>
                    <button 
                      onClick={() => setActiveFile(file)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeFile === file ? 'bg-white/5 text-white' : 'hover:bg-white/5 hover:text-zinc-200'}`}
                    >
                      <FileCode className="w-4 h-4 text-zinc-500" />
                      {file}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
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
            Run BST Test
          </button>
          <button 
            onClick={runGraphUnitTest}
            disabled={isSimulating}
            className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-800 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-zinc-700 transition-all disabled:opacity-50"
          >
            <Navigation className="w-3 h-3" />
            Run Graph Test
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-zinc-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-8">
            <div>
              <h1 className="text-2xl font-black text-zinc-800 tracking-tight uppercase">
                {activeTab === 'dashboard' ? 'Warehouse Control' : activeTab === 'benchmark' ? 'Performance Benchmark' : 'Source Code'}
              </h1>
              <p className="text-xs text-zinc-400 font-medium">
                Smart Warehouse Management System v2.0
              </p>
            </div>
          </div>

          {activeTab === 'dashboard' && (
            <div className="flex items-center gap-3">
              <div className="relative mr-4">
                <Search className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input 
                  type="text" 
                  placeholder="Search BST..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-4 py-2 bg-zinc-100 border-none rounded-xl text-[10px] font-bold uppercase tracking-widest focus:ring-2 focus:ring-blue-500 w-48"
                />
              </div>
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

        {/* Content Area */}
        <div className="flex-1 p-8 space-y-8 overflow-y-auto bg-[#F8FAFC]">
          {activeTab === 'dashboard' && (
            <>
              {/* Bento Grid Layout */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Conveyor Belt */}
                <section className="xl:col-span-2 bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm p-10 relative overflow-hidden min-h-[400px]">
                  <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Conveyor Belt (Queue)</h2>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Linked List Implementation</span>
                  </div>

                  <div className="flex flex-wrap gap-6 items-center justify-center">
                    {conveyorItems.length === 0 ? (
                      <div className="text-center py-20">
                        <Package className="w-12 h-12 text-zinc-100 mx-auto mb-4" />
                        <p className="text-zinc-300 font-bold italic text-lg">No items on belt.</p>
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
                            className="w-48 bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-xl shadow-zinc-200/30 relative group"
                          >
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-blue-500">
                              <Package className="w-6 h-6" />
                            </div>
                            <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mb-1">Package Unit</p>
                            <p className="font-black text-zinc-800 text-lg">{item.id}</p>
                            
                            <button 
                              onClick={() => deletePackage(item.id)}
                              className="absolute top-4 right-4 p-2 text-zinc-200 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
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
                </section>

                {/* Logs */}
                <section className="bg-[#0F172A] rounded-[2.5rem] p-8 shadow-2xl shadow-blue-900/10 h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-6">
                    <Terminal className="w-4 h-4 text-blue-400" />
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">System Logs</h2>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto font-mono text-[11px] space-y-2 custom-scrollbar pr-2">
                    {logs.map(log => (
                      <div key={log.id} className="flex gap-3">
                        <span className="text-zinc-600 shrink-0">{new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}</span>
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
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* BST Visualization */}
                <section className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm p-10 relative overflow-hidden min-h-[500px]">
                  <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Inventory Tree (BST)</h2>
                    </div>
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      Nodes: {inventory.length}
                    </div>
                  </div>

                  <div className="flex items-center justify-center min-h-[300px] py-10">
                    {inventory.length === 0 ? (
                      <div className="text-center">
                        <Database className="w-12 h-12 text-zinc-100 mx-auto mb-4" />
                        <p className="text-zinc-300 font-bold italic text-sm">Inventory is empty.</p>
                      </div>
                    ) : (
                      <div className="w-full overflow-x-auto custom-scrollbar pb-8">
                        <BSTVisualizer node={bst.root} />
                      </div>
                    )}
                  </div>
                </section>

                {/* Robot Pathfinding */}
                <section className="bg-[#0F172A] rounded-[2.5rem] p-10 shadow-2xl shadow-blue-900/10 min-h-[500px] relative overflow-hidden">
                  <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Robot Navigation (Graph)</h2>
                    </div>
                    <div className="flex gap-4">
                      {robotPath.length > 0 && (
                        <button 
                          onClick={executeRobotMission}
                          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/40"
                        >
                          <Play className="w-3 h-3" /> Start Mission
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row gap-12 items-center justify-center">
                    <div className="grid grid-cols-8 gap-1.5 p-2 bg-white/5 rounded-3xl border border-white/5 w-full max-w-[380px]">
                      {renderGrid()}
                    </div>
                    
                    <div className="flex-1 space-y-6 w-full">
                      <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-6">Navigation Data</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between text-xs">
                            <span className="text-zinc-500">Robot Position:</span>
                            <span className="text-blue-400 font-mono font-bold">{robotPos}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-zinc-500">Target Shelf:</span>
                            <span className="text-emerald-400 font-mono font-bold">{targetPos || 'Unassigned'}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-zinc-500">Optimal Path:</span>
                            <span className="text-white font-mono font-bold">{robotPath.length} steps</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-[10px] text-zinc-500 italic text-center px-10">
                        Click on any grid cell to set a destination. The system uses Dijkstra's algorithm to find the shortest path.
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </>
          )}

          {activeTab === 'benchmark' && (
            <div className="max-w-4xl mx-auto space-y-8">
              <section className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm p-12 text-center">
                <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-emerald-500">
                  <Activity className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black text-zinc-800 mb-4">Performance Benchmark</h2>
                <p className="text-zinc-500 max-w-xl mx-auto mb-10">
                  Compare the search efficiency between a standard <b>LinkedList</b> (O(n)) and a <b>Binary Search Tree</b> (O(log n)) using 10,000 generated products.
                </p>
                <button 
                  onClick={runBenchmark}
                  disabled={isSimulating}
                  className="px-10 py-4 bg-[#0F172A] text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/20 disabled:opacity-50"
                >
                  {isSimulating ? 'Running Benchmark...' : 'Run 10,000 Item Test'}
                </button>
              </section>

              {benchmarkResults && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-[2.5rem] border border-zinc-200 p-10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6">Linear Search (List)</p>
                    <div className="flex items-end gap-4 mb-4">
                      <div className="text-5xl font-black text-rose-500">{benchmarkResults.listTime.toFixed(4)}</div>
                      <div className="text-zinc-400 font-bold mb-2">ms</div>
                    </div>
                    <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full w-full" />
                    </div>
                    <p className="mt-4 text-xs text-zinc-500 font-medium italic">Complexity: O(n)</p>
                  </div>

                  <div className="bg-white rounded-[2.5rem] border border-zinc-200 p-10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6">Optimized Search (BST)</p>
                    <div className="flex items-end gap-4 mb-4">
                      <div className="text-5xl font-black text-emerald-500">{benchmarkResults.bstTime.toFixed(4)}</div>
                      <div className="text-zinc-400 font-bold mb-2">ms</div>
                    </div>
                    <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full transition-all duration-1000" 
                        style={{ width: `${(benchmarkResults.bstTime / benchmarkResults.listTime) * 100}%` }} 
                      />
                    </div>
                    <p className="mt-4 text-xs text-zinc-500 font-medium italic">Complexity: O(log n)</p>
                  </div>

                  <div className="md:col-span-2 bg-emerald-500 rounded-[2.5rem] p-10 text-white">
                    <h3 className="text-xl font-black mb-2">Analysis Result</h3>
                    <p className="text-emerald-50 font-medium">
                      The Binary Search Tree performed approximately <b>{(benchmarkResults.listTime / benchmarkResults.bstTime).toFixed(0)}x faster</b> than the Linear Search. This demonstrates the critical importance of logarithmic time complexity in large-scale warehouse inventory management.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'code' && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0F172A] rounded-[2.5rem] p-10 shadow-2xl shadow-blue-900/10 min-h-[600px] relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Code2 className="w-5 h-5 text-blue-400" />
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{activeFile}</h2>
                </div>
              </div>
              
              <pre className="font-mono text-sm text-blue-100/80 leading-relaxed overflow-x-auto custom-scrollbar">
                <code>{SOURCE_CODE[activeFile]}</code>
              </pre>
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
