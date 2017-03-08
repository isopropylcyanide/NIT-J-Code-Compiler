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
            if self.lang == 'java':
                os.system('javac ' + self.file_name)
            elif self.lang == 'c':
                os.system('gcc -o ' + self.name + ' ' + self.file_name)
            elif self.lang == 'cpp':
                os.system('g++ -o ' + self.name + ' ' + self.file_name)
            elif self.lang == 'py':
                return 200

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

        if self.lang == 'java':
            cmd = 'java ' + self.name
        elif self.lang in ['c', 'cpp']:
            cmd = './' + self.name
        elif self.lang == "py":
            cmd = 'python ' + self.file_name
        if self.inp_file == "":
            r = os.system('timeout ' + self.timeout + ' ' +
                          cmd + ' > ' + self.actualout)
        else:
            r = os.system('timeout ' + self.timeout + ' ' + cmd +
                          ' < ' + 'stdin' + ' > ' + self.actualout)
            # os.remove("stdin")

        # Perform cleanup
        if self.lang == 'java':
            os.remove(self.name + '.class')
        elif self.lang in ['c', 'cpp']:
            os.remove(self.name)

        if r == 0:
            return 200
        elif r == 31744:
            os.remove(self.actualout)
            return 408
        else:
            os.remove(self.actualout)
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
    expectedOut = "out.txt"
    timeout = '2'  # secs

    new_program = program(file_name, inp_file, timeout, prog_name, expectedOut)

    if not new_program.isvalidFile():
        print 'Invalid file name or extension'
        exit()

    output = '\nCompilation : ', codes[new_program.compile()]
    output += '\nRuntime : ', codes[new_program.run()]
    output += '\n\n', new_program.readOutput()

    os.remove(file_name)
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
