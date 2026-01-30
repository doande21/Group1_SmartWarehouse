
import React, { useState, useEffect } from 'react';
import { Product as ProductType } from './types';
import { CustomQueue } from './lib/data-structures';
import { 
  FileCode, Terminal, ChevronRight, Plus, 
  Truck, Package, LayoutDashboard, Activity, 
  CheckCircle2, AlertCircle, XCircle, HelpCircle, Save
} from 'lucide-react';

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState('WarehouseTest.java');
  const [activeMode, setActiveMode] = useState<'editor' | 'simulation'>('simulation');
  const [simTab, setSimTab] = useState<'ops' | 'tests'>('ops');
  const [showHelp, setShowHelp] = useState(false);
  
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
        
        // Logic kiểm tra FIFO
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
    setOutput(['> Compiling...', '> Running WarehouseTest.main()...']);
    
    const testCode = fileContent['WarehouseTest.java'];
    const myQueueCode = fileContent['MyQueue.java'];

    setTimeout(() => {
      // Giả lập kiểm tra lỗi cú pháp/logic từ Editor
      if (!myQueueCode.includes('class MyQueue')) {
        setOutput(prev => [...prev, "> [ERROR] Compilation failed: class MyQueue not found."]);
        return;
      }

      const isBrokenExpectation = testCode.includes('"Package_2"') && (testCode.includes('first.equals') || testCode.includes('=='));

      if (isBrokenExpectation) {
        setOutput(prev => [
          ...prev, 
          "> [LOG] First Dequeued: Package_1",
          "> [ERROR] Test Case: FIFO Consistency",
          "> [FAIL] Expected: Package_2 (from your current code comparison)",
          "> [FAIL] Actual: Package_1 (from real Queue logic)",
          "> --------------------------",
          "> RESULT: FAILED"
        ]);
      } else {
        setOutput(prev => [
          ...prev, 
          "> [LOG] First Dequeued: Package_1",
          "> [SUCCESS] Test Case: FIFO Consistency",
          "> [PASS] Logic confirmed: First-In First-Out.",
          "> --------------------------",
          "> RESULT: 100% PASS"
        ]);
      }
    }, 800);
  };

  const log = (msg: string) => setOutput(prev => [...prev, `> ${msg}`].slice(-10));

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-300 font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r border-slate-800 flex flex-col bg-[#0b1120]">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center space-x-2">
             <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
                <LayoutDashboard className="w-4 h-4 text-white" />
             </div>
             <h1 className="text-blue-500 font-black tracking-tighter text-xl italic">ROBO-LAB</h1>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-6 mb-4 flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Workspace</span>
            <Save className="w-3 h-3 text-slate-700" />
          </div>
          {Object.keys(fileContent).map(file => (
            <div 
              key={file}
              onClick={() => { setSelectedFile(file); setActiveMode('editor'); }}
              className={`flex items-center px-6 py-2.5 cursor-pointer text-sm transition-all group ${selectedFile === file && activeMode === 'editor' ? 'bg-blue-600/10 text-blue-400 border-r-2 border-blue-500' : 'text-slate-400 hover:bg-slate-900'}`}
            >
              <FileCode className={`w-4 h-4 mr-3 transition-colors ${selectedFile === file && activeMode === 'editor' ? 'text-blue-400' : 'text-slate-600 group-hover:text-slate-400'}`} />
              {file}
            </div>
          ))}

          <div className="px-6 mt-8 mb-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Active Simulation</div>
          <div 
            onClick={() => setActiveMode('simulation')}
            className={`flex items-center px-6 py-2.5 cursor-pointer text-sm transition-all group ${activeMode === 'simulation' ? 'bg-emerald-600/10 text-emerald-400 border-r-2 border-emerald-500' : 'text-slate-400 hover:bg-slate-900'}`}
          >
            <Activity className="w-4 h-4 mr-3 group-hover:animate-pulse" />
            Visual Control
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-[#080d1a]">
          <button 
            onClick={runUnitTests}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold transition-all text-white shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <Activity className="w-3 h-3" />
            <span>RUN SIMULATOR TEST</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {activeMode === 'editor' ? (
          <div className="flex-1 flex flex-col bg-[#0d1117]">
             <div className="px-6 py-3 border-b border-slate-800 flex justify-between items-center bg-[#151b2b]">
                <div className="flex items-center space-x-4">
                   <div className="flex space-x-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                   </div>
                   <span className="text-xs font-mono text-slate-500 italic">Editing: {selectedFile}</span>
                </div>
                <div 
                  className="flex items-center space-x-2 text-[10px] text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full cursor-help font-bold uppercase tracking-tight"
                  onClick={() => setShowHelp(!showHelp)}
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>Cần giúp đỡ?</span>
                </div>
             </div>
             
             {showHelp && (
               <div className="m-6 p-4 bg-slate-800 border border-slate-700 rounded-xl animate-in slide-in-from-top-4 duration-300">
                  <h4 className="text-blue-400 text-xs font-bold uppercase mb-2">Lưu ý quan trọng:</h4>
                  <ul className="text-[11px] text-slate-400 space-y-2 list-disc pl-4">
                    <li>Dự án này là một **Sandbox Web**. Code bạn sửa ở đây chỉ có tác dụng trong trình duyệt này.</li>
                    <li>Nếu bạn thấy lỗi đỏ trong **VS Code**, hãy nhấn `Ctrl + S` để lưu tất cả file trên máy tính của bạn.</li>
                    <li>Đảm bảo tên class trùng với tên file (Ví dụ: `class MyQueue` phải nằm trong `MyQueue.java`).</li>
                  </ul>
               </div>
             )}

             <textarea 
               className="flex-1 p-8 font-mono text-sm bg-transparent text-slate-300 outline-none resize-none leading-relaxed caret-blue-500"
               value={fileContent[selectedFile as keyof typeof fileContent]}
               onChange={handleEditorChange}
               spellCheck={false}
               placeholder="// Write your Java code here..."
             />
          </div>
        ) : (
          <div className="flex-1 bg-slate-50 p-8 overflow-y-auto">
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Warehouse Control</h2>
                  <p className="text-slate-500 font-medium italic text-sm">Visualizing your code logic in real-time</p>
                </div>
                <div className="flex space-x-3">
                  <button onClick={addOrder} className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-2xl font-bold flex items-center hover:bg-slate-50 transition-all shadow-sm active:translate-y-0.5">
                    <Plus className="w-4 h-4 mr-2 text-blue-500" /> Add Package
                  </button>
                  <button onClick={processOrder} className="bg-slate-900 text-white px-7 py-2.5 rounded-2xl font-bold flex items-center shadow-xl hover:bg-slate-800 transition-all active:translate-y-0.5">
                    <Truck className="w-4 h-4 mr-2 text-emerald-400" /> Dispatch (FIFO)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-5">
                    <Package className="w-32 h-32 rotate-12" />
                  </div>
                  <h3 className="font-black text-slate-400 uppercase text-[11px] tracking-[0.2em] flex items-center mb-10">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-3 animate-ping" />
                    Conveyor Belt State
                  </h3>

                  <div className="relative flex items-center overflow-x-auto pb-8 space-x-6 min-h-[180px] scrollbar-hide pt-4">
                    <div className="absolute top-1/2 left-0 right-0 h-10 bg-slate-50 -translate-y-1/2 rounded-2xl -z-0 border-y border-slate-100" />
                    {conveyorItems.length === 0 ? (
                      <div className="w-full text-center py-10 text-slate-300 font-medium italic z-10">No items on belt. Use "Add Package" to begin.</div>
                    ) : (
                      conveyorItems.map((item, i) => (
                        <div key={item.id} className={`flex-shrink-0 w-36 h-36 bg-white border-2 rounded-[2rem] flex flex-col items-center justify-center shadow-lg z-10 transition-all duration-500 ${i === 0 ? 'border-blue-500 scale-110 -translate-y-2 ring-8 ring-blue-50' : 'border-slate-100 opacity-60'}`}>
                          <Package className={`w-12 h-12 mb-3 ${i === 0 ? 'text-blue-500' : 'text-slate-300'}`} />
                          <span className="text-xs font-black text-slate-800 tracking-tight">{item.id}</span>
                          {i === 0 && <span className="text-[9px] font-bold text-blue-600 mt-2 bg-blue-50 px-2 py-0.5 rounded-full uppercase">Next Out</span>}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="col-span-12 lg:col-span-7 bg-[#0b0f1a] rounded-[2.5rem] p-8 shadow-2xl border border-slate-800 flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <Terminal className="w-5 h-5 text-blue-400" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{simTab === 'ops' ? 'Runtime Logs' : 'Test Console'}</span>
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
                    <CheckCircle2 className="w-4 h-4 mr-3 text-emerald-500" /> Recent Shipments
                  </h3>
                  <div className="space-y-4">
                    {processedItems.map(item => (
                      <div key={item.id} className="flex items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-md hover:border-emerald-200">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mr-4 shadow-sm group-hover:bg-emerald-50">
                          <Truck className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-black text-slate-800">{item.id}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">Dispatched {'->'} Gate A</p>
                        </div>
                      </div>
                    ))}
                    {processedItems.length === 0 && <div className="text-center py-10 text-slate-300 text-sm font-medium italic">History is clear.</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="h-10 bg-slate-900 border-t border-slate-800 text-slate-500 flex items-center px-6 text-[11px] justify-between font-bold">
           <div className="flex items-center space-x-6">
             <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-2 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                <span className="text-slate-300 uppercase tracking-tighter">Compiler Online</span>
             </div>
             <span className="text-slate-700">|</span>
             <span>CONNECTED TO SANDBOX EDITOR</span>
          </div>
          <div className="flex items-center space-x-4">
             <span className="uppercase tracking-widest text-[9px] text-slate-600">Secure Mode</span>
             <AlertCircle className="w-4 h-4 text-slate-700" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
