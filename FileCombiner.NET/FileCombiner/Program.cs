using System;
using System.Collections.Concurrent;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace FileCombiner
{
    /// <summary>
    /// Very rough analogy to the node.js FileCombiner
    /// The C# Event loop runs on one thread and spawns child threads for processing files.
    /// The point here is that while C# has come a *LONG* way - with async semantics built into the
    /// language - you still have to be aware of the plumbing.  In node.js, not so much.
    /// </summary>
    class Program
    {
        private static string _dirPath = @"C:\GIT\DevLink-2011---Getting-Started-With-Nodejs\FileCombiner .NET\FileCombiner\Files";
        private static string _outFile = Path.Combine(_dirPath, @"Output\output.txt");
        static void Main(string[] args)
        {
            File.Delete(_outFile);
            var output = new OutputWriter(_outFile);
            var eventLoop = new EventLoop();
            var start = DateTime.Now;
            eventLoop.Start();
            eventLoop.Enqueue( () => Directory
                                         .GetFiles( _dirPath )
                                         .AsParallel()
                                         .ForAll( file => File.ReadAllLines( file )
                                                              .AsParallel()
                                                              .ForAll(line => 
                                                                        eventLoop.Enqueue(() => output.WriteOutput(String.Format("{0}\t{1}", file, line)) ))));
            while(output.Written < 25000) // Cheating - I know the count ahead of time.
            {
                Thread.Sleep(1000);
                Console.Clear();
                Console.WriteLine("Written: {0}", output.Written);
            }
            var timeToProcess = DateTime.Now.Subtract( start );
            Console.WriteLine("Processing took approximately {0} second(s)", timeToProcess.Seconds);
            Console.WriteLine("Press Enter to exit");
            Console.ReadLine();
        }
    }

    public class OutputWriter
    {
        private readonly Object _writeSync = new Object();
        private readonly string _path;
        private readonly ReaderWriterLockSlim _slim = new ReaderWriterLockSlim();
        private int _written;

        public OutputWriter(string path)
        {
            _path = path;
        }

        public void WriteOutput( string line )
        {
            lock(_writeSync) // Yep, locks every time - enough for example
            {
                _written++;
                using(var fs = File.AppendText(_path))
                {
                    fs.WriteLine(line);
                }
            }
        }

        public int Written
        {
            get 
            {
                _slim.EnterReadLock();
                try
                {
                    return _written;
                }
                finally
                {
                    _slim.ExitReadLock();
                }
            }
        }
    }

    public class EventLoop
    {
        public bool Running { get; set; }
        public ConcurrentQueue<Action> ActionQueue { get; set; }
        public ManualResetEventSlim Wait { get; set; }
        
        public void Loop()
        {
            while( Running )
            {
                Action action = null;
                if( ActionQueue.TryDequeue( out action ) )
                {
                    try
                    {
                        // Making an assumption here that every action gets its own thread
                        // This is only the case for I/O in node.js, so not the fairest of comparisons
                        Task.Factory.StartNew( action );
                    }
                    catch( Exception ex )
                    {
                        Console.WriteLine( ex );
                    }
                }
                else 
                {
                    Wait.Reset();
                    Wait.Wait();
                }
            }
        }

        public void Enqueue( Action action ) 
        {
            ActionQueue.Enqueue( action );
            Wait.Set();
        }

        public void Start() 
        {
            Running = true;
            Task.Factory.StartNew(Loop);
        }

        public void Stop() 
        {
            Running = false;
            Wait.Set();
        }

        public EventLoop( ) 
        {
            ActionQueue = new ConcurrentQueue<Action>();
            Wait = new ManualResetEventSlim( false );
        }
    }
}
