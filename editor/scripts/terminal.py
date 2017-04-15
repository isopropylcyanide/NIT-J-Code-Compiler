import subprocess
import socket
import random
"""
Script that allocates a new terminal by spawning a new wetty instance
at a given port that ssh's to the given user's directory
"""

PORT_MIN = 9001
PORT_MAX = 65000


class SocketInUseException(Exception):
    pass


def checkPortStatus(port):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = s.connect_ex(('', port))

    if result == 0:
        raise SocketInUseException('socket %s in use' % (port))
    s.close()
    return True


def getUsablePort():
    """Finds and returns a usable port"""
    available_port = False
    while available_port is False:
        port = random.randrange(PORT_MIN, PORT_MAX)
        try:
            available_port = checkPortStatus(port)
        except SocketInUseException as e:
            raise e
        else:
            return port


class terminal:
    """Class that allocates a terminal server"""

    def __init__(self, sshuser, port):
        self.port = port
        self.https = False
        self.sshuser = sshuser
        self.running = False
        self.pid = None

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        self.pid.terminate()

    def allocate(self):
        """Starts a wetty server from a random port"""
        try:
            self.pid = subprocess.Popen(
                ['node', '../../wetty/app.js', '-sshhost',
                 '--sshuser', str(self.sshuser), '-p', str(self.port)])
            self.running = True
            return self.port
        except Exception as e:
            raise e

    def terminate(self):
        """Closes the terminal session explicitly"""
        if self.pid is not None:
            self.running = False
            self.pid.terminate()
            self.pid = None
