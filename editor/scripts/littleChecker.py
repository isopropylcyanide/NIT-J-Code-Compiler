import os
import filecmp
import re
import sys

codes = {200: 'success', 404: 'file_name not found',
         400: 'error', 408: 'timeout'}


class program:
    """Class that handles all nitty gritties of a user program"""

    def __init__(self, string, inp, timeout, prog_name, exp_out=""):
        """Receives a name of a file from the user
            It must be a valid c, c++, java file
        """
        self.file_name = string  # Full name of the program
        self.lang = None  # Language
        self.name = None  # Name without extension
        self.inp_file = inp  # Input file
        self.expectedout = exp_out  # Correct output file
        self.actualout = "out.txt"  # Actual output file
        self.timeout = timeout  # Timeout set for execution
        self.prog_name = prog_name  # Name of class #only for java
        self.log = "log.txt"  # Log of crashed files

    def isvalidFile(self):
        """Check if the filename is valid"""
        p = re.compile("^(\S+)\.(java|cpp|c|py)$")
        matchObj = p.match(self.file_name)
        if matchObj:
            self.name, self.lang = matchObj.groups()
            return True
        return False

    def compile(self):
        """Compiles the given program"""

        # Remove previous executables
        if (os.path.isfile(self.name)):
            os.remove(self.name)

        if (os.path.isfile(self.file_name)):
            r = 0
            if self.lang == 'java':
                r = os.system('javac ' + self.file_name + ' 2> ' + self.log)
            elif self.lang == 'c':
                r = os.system('gcc -o ' + self.name + ' ' +
                              self.file_name + ' 2> ' + self.log)
            elif self.lang == 'cpp':
                r = os.system('g++ -o ' + self.name + ' ' +
                              self.file_name + ' 2> ' + self.log)

            if self.lang == 'py':
                return 200
            if r != 0:
                raise IOError

            # compilation is successful if the exe is created
            if (os.path.isfile(self.name)):
                return 200
            # For java files
            elif (os.path.isfile(self.name + '.class')):
                return 200
            else:
                return 400
        else:
            return 404

    def run(self):
        with open('stdin', 'w') as f:
            f.write(self.inp_file)
        r = 0

        if self.lang == 'java':
            cmd = 'java ' + self.name
        elif self.lang in ['c', 'cpp']:
            cmd = './' + self.name
        elif self.lang == "py":
            cmd = 'python ' + self.file_name

        if self.inp_file == "":
            r = os.system('timeout ' + self.timeout + ' ' +
                          cmd + ' > ' + self.actualout + ' 2>&1 ')
        else:
            r = os.system('timeout ' + self.timeout + ' ' + cmd + '< '
                          'stdin' + ' > ' + self.actualout + ' 2>&1 ')
            os.remove("stdin")

        # Perform cleanup
        if self.lang == 'java':
            os.remove(self.name + '.class')
        elif self.lang in ['c', 'cpp']:
            os.remove(self.name)

        if r == 0:
            print 'if chal'
            return 200
        elif r == 31744:
            os.remove(self.actualout)
            return 408
        else:
            raise IOError
            return 400

    def match(self):
        print self.actualout, self.expectedout
        if os.path.isfile(self.actualout) and os.path.isfile(self.expectedout):
            b = filecmp.cmp(self.actualout, self.expectedout)
            return b
        else:
            return 404

    def readOutput(self):
        # Read the actualOutput
        out = ""
        with open(self.actualout, "r") as f:
            for i in f.readlines():
                out += i
        return out


def main(file_name, inp_file, prog_name):
    pwd = os.getcwd()
    os.chdir('editor/scripts/')

    if inp_file is None:
        inp_file = ""
    print 'filename: ', file_name, ' and inp: ', inp_file
    timeout = '2'  # secs

    new_program = program(file_name, inp_file, timeout, prog_name)

    if not new_program.isvalidFile():
        print 'Invalid file name or extension'
        exit()

    try:
        output = '\nCompilation : %s' % (codes[new_program.compile()])
    except Exception:
        output = '\nCompilation failed: '
        with open(new_program.log, "r") as f:
            for i in f.readlines():
                output += i
        # remove log
        os.remove(new_program.log)
        return output

    try:
        output += '\nRunning : %s' % (codes[new_program.run()])
    except Exception, e:
        print str(e)
        output += '\nRuntime failed: '

        with open(new_program.actualout, 'r') as f:
            for i in f.readlines():
                output += i
        return output

    # cleanup
    output += '\n\n%s' % (new_program.readOutput())
    os.remove(new_program.file_name)
    os.remove(new_program.actualout)
    os.remove(new_program.log)
    os.chdir(pwd)
    return output

if __name__ == '__main__':
    # receive arguments name.extension stdin
    inp_file = ""
    if len(sys.argv) < 2:
        print '\n Usage: python littleChecker.py name.ext stdin(maybe_empty)\n'
        exit()
    elif len(sys.argv) > 4:
        inp_file = sys.argv[2].strip()
    print main(sys.argv[1], inp_file, sys.argv[3])
