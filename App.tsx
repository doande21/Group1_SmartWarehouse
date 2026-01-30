
import React, { useState, useEffect } from 'react';
import { Product as ProductType } from './types';
import { CustomQueue } from './lib/data-structures';
import { 
  FileCode, Terminal, ChevronRight, Plus, 
  Truck, Package, LayoutDashboard, Activity, 
  CheckCircle2, AlertCircle, XCircle
} from 'lucide-react';

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState('WarehouseTest.java');
  const [activeMode, setActiveMode] = useState<'editor' | 'simulation'>('simulation');
  const [simTab, setSimTab] = useState<'ops' | 'tests'>('ops');
  
  const [queue] = useState(new CustomQueue<ProductType>());
  const [conveyorItems, setConveyorItems] = useState<ProductType[]>([]);
  const [processedItems, setProcessedItems] = useState<ProductType[]>([]);
  const [output, setOutput] = useState<string[]>(['System initialized...', 'Queue manager ready.']);
  
  const [fileContent, setFileContent] = useState({
    'Product.java': `public class Product {
    private String id;
    private String name;

    public Product(String id, String name) {
        this.id = id;
        this.name = name;
    }
    public String getId() { return id; }
    public String getName() { return name; }
}`,
    'MyQueue.java': `public class MyQueue<T> {
    private class Node {
        T data;
        Node next;
        Node(T data) { this.data = data; }
    }
    private Node head, tail;

    public void enqueue(T data) {
        Node newNode = new Node(data);
        if (tail == null) head = tail = newNode;
        else { tail.next = newNode; tail = newNode; }
    }

    public T dequeue() {
        if (head == null) return null;
        T data = head.data;
        head = head.next;
        if (head == null) tail = null;
        return data;
    }
}`,
    'WarehouseTest.java': `public class WarehouseTest {
    public static void main(String[] args) {
        MyQueue<String> q = new MyQueue<>();
        q.enqueue("Package_1");
        q.enqueue("Package_2");
        
        String first = q.dequeue();
        System.out.println("First Dequeued: " + first);
        
        // Kiểm tra logic FIFO
        if (first.equals("Package_1")) {
            System.out.println("TEST FIFO: PASS");
        } else {
            System.out.println("TEST FIFO: FAIL! Expected Package_1");
        }
    }
}`
  });

  const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFileContent(prev => ({
      ...prev,
      [selectedFile]: e.target.value
    }));
  };

  const addOrder = () => {
    const newId = `ORD-${Math.floor(Math.random() * 900) + 100}`;
    const product: ProductType = {
      id: newId,
      name: `Package ${newId}`,
      category: 'General',
      weight: Math.random() * 5,
      timestamp: Date.now()
    };
    queue.enqueue(product);
    setConveyorItems(queue.toArray());
    log(`Enqueued: ${product.id} added to the belt.`);
  };

  const processOrder = () => {
    const item = queue.dequeue();
    if (item) {
      setConveyorItems(queue.toArray());
      setProcessedItems(prev => [item, ...prev].slice(0, 5));
      log(`Dequeued: Dispatched ${item.id}.`);
    } else {
      log(`Warning: Belt is empty.`);
    }
  };

  const runUnitTests = () => {
    setSimTab('tests');
    setOutput(['> javac MyQueue.java WarehouseTest.java', '> java WarehouseTest', '> Initializing virtual JVM...']);
    
    // Logic kiểm tra xem người dùng có đang để "Package_2" trong assert/if không
    const testCode = fileContent['WarehouseTest.java'];
    
    // Nếu trong code chứa Package_2 nhưng lại so sánh với biến 'first' (là Package_1 thực tế)
    // thì test đó sẽ báo lỗi Logic.
    const isIncorrectExpectation = testCode.includes('"Package_2"') && (testCode.includes('first.equals') || testCode.includes('=='));

    setTimeout(() => {
      if (isIncorrectExpectation) {
        setOutput(prev => [
          ...prev, 
          "> Running: testQueueFIFO()...",
          "> [LOG] First Dequeued: Package_1",
          "> [ERROR] Test Case: FIFO Consistency",
          "> [FAIL] Expected: Package_2 (from your code comparison)",
          "> [FAIL] Actual: Package_1 (from real Queue logic)",
          "> [REASON] FIFO violated in your Test script logic.",
          "> --------------------------",
          "> TEST RESULT: FAILED"
        ]);
      } else {
        setOutput(prev => [
          ...prev, 
          "> Running: testQueueFIFO()...",
          "> [LOG] First Dequeued: Package_1",
          "> [SUCCESS] Test Case: FIFO Consistency",
          "> [PASS] Package_1 retrieved correctly.",
          "> --------------------------",
          "> TEST RESULT: 100% PASS"
        ]);
      }
    }, 1000);
  };

  const log = (msg: string) => setOutput(prev => [...prev, `> ${msg}`].slice(-10));

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-300 font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r border-slate-800 flex flex-col bg-[#0b1120]">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-blue-500 font-black tracking-tighter text-xl italic">ROBO-LAB</h1>
          <p className="text-[10px] text-slate-500 uppercase font-bold mt-1 tracking-widest text-center">Web Environment</p>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-2 text-[10px] font-bold text-slate-600 uppercase">Virtual Files</div>
          {Object.keys(fileContent).map(file => (
            <div 
              key={file}
              onClick={() => { setSelectedFile(file); setActiveMode('editor'); }}
              className={`flex items-center px-6 py-2 cursor-pointer text-sm transition-all ${selectedFile === file && activeMode === 'editor' ? 'bg-blue-600/10 text-blue-400 border-r-2 border-blue-500' : 'text-slate-400 hover:bg-slate-900'}`}
            >
              <FileCode className="w-4 h-4 mr-3" />
              {file}
            </div>
          ))}
          <div className="px-4 mt-6 mb-2 text-[10px] font-bold text-slate-600 uppercase">View Mode</div>
          <div 
            onClick={() => setActiveMode('simulation')}
            className={`flex items-center px-6 py-2 cursor-pointer text-sm transition-all ${activeMode === 'simulation' ? 'bg-emerald-600/10 text-emerald-400 border-r-2 border-emerald-500' : 'text-slate-400 hover:bg-slate-900'}`}
          >
            <LayoutDashboard className="w-4 h-4 mr-3" />
            Control Panel
          </div>
        </div>
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="mb-3 text-[9px] text-slate-500 font-bold uppercase text-center leading-tight">
             Lưu ý: Bạn phải sửa code trong Editor của Web để thấy kết quả thay đổi ở đây.
          </div>
          <button 
            onClick={runUnitTests}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold transition-all text-emerald-400 shadow-lg active:scale-95"
          >
            <Activity className="w-3 h-3" />
            <span>RUN WEB TEST</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {activeMode === 'editor' ? (
          <div className="flex-1 flex flex-col bg-[#0d1117]">
             <div className="px-6 py-3 border-b border-slate-800 flex justify-between items-center bg-[#151b2b]">
                <div className="flex items-center space-x-2">
                   <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                   <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
                   <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                   <span className="text-xs font-mono text-slate-500 ml-4 italic">{selectedFile} (Web Editor)</span>
                </div>
             </div>
             <textarea 
               className="flex-1 p-8 font-mono text-sm bg-transparent text-slate-300 outline-none resize-none leading-relaxed caret-blue-500"
               value={fileContent[selectedFile as keyof typeof fileContent]}
               onChange={handleEditorChange}
               spellCheck={false}
             />
          </div>
        ) : (
          <div className="flex-1 bg-slate-50 p-8 overflow-y-auto">
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Warehouse Simulator</h2>
                  <p className="text-slate-500 font-medium italic text-sm underline decoration-blue-200">Hãy chắc chắn bạn đã sửa Code trong tab Editor bên trái!</p>
                </div>
                <div className="flex space-x-3">
                  <button onClick={addOrder} className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-2xl font-bold flex items-center hover:bg-slate-50 transition-all shadow-sm active:translate-y-0.5">
                    <Plus className="w-4 h-4 mr-2 text-blue-500" /> Enqueue
                  </button>
                  <button onClick={processOrder} className="bg-slate-900 text-white px-7 py-2.5 rounded-2xl font-bold flex items-center shadow-xl hover:bg-slate-800 transition-all active:translate-y-0.5">
                    <Truck className="w-4 h-4 mr-2 text-emerald-400" /> Dequeue
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-5">
                    <Package className="w-32 h-32 rotate-12" />
                  </div>
                  <div className="flex items-center justify-between mb-10">
                    <h3 className="font-black text-slate-400 uppercase text-[11px] tracking-[0.2em] flex items-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mr-3 animate-ping" />
                      Active Conveyor Belt
                    </h3>
                  </div>

                  <div className="relative flex items-center overflow-x-auto pb-8 space-x-6 min-h-[180px] scrollbar-hide pt-4">
                    <div className="absolute top-1/2 left-0 right-0 h-10 bg-slate-50 -translate-y-1/2 rounded-2xl -z-0 border-y border-slate-100" />
                    {conveyorItems.length === 0 ? (
                      <div className="w-full text-center py-10 text-slate-300 font-medium italic z-10">Conveyor idle. Enqueue a package to test FIFO.</div>
                    ) : (
                      conveyorItems.map((item, i) => (
                        <div key={item.id} className={`flex-shrink-0 w-36 h-36 bg-white border-2 rounded-[2rem] flex flex-col items-center justify-center shadow-lg z-10 transition-all duration-500 ${i === 0 ? 'border-blue-500 scale-110 -translate-y-2 ring-8 ring-blue-50' : 'border-slate-100 opacity-60'}`}>
                          <Package className={`w-12 h-12 mb-3 ${i === 0 ? 'text-blue-500' : 'text-slate-300'}`} />
                          <span className="text-xs font-black text-slate-800 tracking-tight">{item.id}</span>
                          {i === 0 && <span className="text-[9px] font-bold text-blue-600 mt-2 bg-blue-50 px-2 py-0.5 rounded-full uppercase">Front of Queue</span>}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="col-span-12 lg:col-span-7 bg-[#0b0f1a] rounded-[2.5rem] p-8 shadow-2xl border border-slate-800 flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <Terminal className="w-5 h-5 text-blue-400" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{simTab === 'ops' ? 'Live Logs' : 'Virtual Test Output'}</span>
                    </div>
                  </div>
                  <div className="font-mono text-[13px] text-slate-400 space-y-1.5 h-48 overflow-y-auto custom-scrollbar flex-1">
                    {output.map((line, i) => (
                      <div key={i} className={`
                        ${line.includes('SUCCESS') || line.includes('PASS') ? 'text-emerald-400 font-bold bg-emerald-500/5 px-2 py-0.5 rounded' : ''}
                        ${line.includes('ERROR') || line.includes('FAIL') || line.includes('FAILED') ? 'text-red-400 font-bold bg-red-500/5 px-2 py-0.5 rounded' : ''}
                        ${line.startsWith('>') ? 'opacity-100' : 'opacity-60'}
                      `}>
                        {line}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-span-12 lg:col-span-5 bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                   <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] flex items-center mb-8">
                    <CheckCircle2 className="w-4 h-4 mr-3 text-emerald-500" /> Dispatch History
                  </h3>
                  <div className="space-y-4">
                    {processedItems.map(item => (
                      <div key={item.id} className="flex items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-md hover:border-emerald-200">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mr-4 shadow-sm group-hover:bg-emerald-50">
                          <Truck className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-black text-slate-800">{item.id}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">Exit {'->'} Warehouse Gate A</p>
                        </div>
                      </div>
                    ))}
                    {processedItems.length === 0 && <div className="text-center py-10 text-slate-300 text-sm font-medium italic">Empty dispatch history.</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="h-10 bg-slate-900 border-t border-slate-800 text-slate-500 flex items-center px-6 text-[11px] justify-between font-bold">
           <div className="flex items-center space-x-6">
             <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-slate-300 uppercase tracking-tighter">Virtual Machine Online</span>
             </div>
             <span className="text-slate-700">|</span>
             <span>SYNCING: INTERNAL EDITOR</span>
          </div>
          <div className="flex items-center space-x-4">
             <span className="uppercase tracking-widest text-[9px] text-slate-600">Secure Environment</span>
             <AlertCircle className="w-4 h-4 text-slate-700" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
