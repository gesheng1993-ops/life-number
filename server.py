"""Dev server — auto-appends .html for clean URLs."""
import http.server
import os
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
DIR = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        print(f'[server] {self.command} {self.path}', flush=True)
        path = self.path.split('?')[0]
        if path != '/' and not path.startswith('/src/') and '.' not in os.path.basename(path):
            html = path + '.html'
            if os.path.isfile(DIR + html):
                self.path = html + ('?' + self.path.split('?')[1] if '?' in self.path else '')
                print(f'[server]   → rewrote to {self.path}', flush=True)
        super().do_GET()

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

if __name__ == '__main__':
    os.chdir(DIR)
    from socketserver import ThreadingMixIn
    class ThreadedServer(ThreadingMixIn, http.server.HTTPServer):
        daemon_threads = True
    ThreadedServer(('0.0.0.0', PORT), Handler).serve_forever()
