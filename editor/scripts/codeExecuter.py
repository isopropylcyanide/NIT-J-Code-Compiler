import os
import re
import sys
"""
Script that monitors compilation and running of an output program.
Return errors if any , with the appropriate error code
"""

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
                r = os.system('gcc   \
                 -lm -o ' + self.name + ' ' +
                              self.file_name + ' 2> ' + self.log)
            elif self.lang == 'cpp':
                r = os.system('g++  \
                -lpthread -lm -o ' + self.name + ' ' +
                              self.file_name + ' 2> ' + self.log)

            elif self.lang == 'py':
                r = os.system('echo > ' + self.log)
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
        # Prepare stdin from user input
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

        # Perform cleanup
        # if self.lang == 'java':
        #     # Remove all class files
        #     for classfile in os.listdir(os.getcwd()):
        #         if '.class' in classfile:
        #             os.remove(classfile)
        # elif self.lang in ['c', 'cpp']:
        #     os.remove(self.name)

        if r == 0:
            return 200
        elif r == 31744:
            return 408
        else:
            raise IOError
            return 400

    def readOutput(self):
        # Read the actualOutput
        out = ""
        with open(self.actualout, "r") as f:
            for i in f.readlines():
                out += i
        return out


def main(file_name, inp_file, prog_name):
    """Proposed entry point for compilation init"""
    if inp_file is None:
        inp_file = ""
    timeout = '2'  # secs

    new_program = program(file_name, inp_file, timeout, prog_name)

    if not new_program.isvalidFile():
        raise Exception('Invalid file name or extension')
    try:
        output = '\nCompilation : %s' % (codes[new_program.compile()])

        try:
            output += '\nRuntime : %s\n\n' % (codes[new_program.run()])
        except Exception, e:
            print 'Exception caught in runtime:', str(e)
            output += '\nRuntime failed: \n'

            # if language is java, remove classes
            if new_program.lang == "java":
                print 'remove java ', new_program.file_name
        finally:
            output += "\n\n"
            with open(new_program.actualout, 'r') as f:
                for i in f.readlines():
                    output += i

            # output += '\n\n%s' % (new_program.readOutput())
            # if (os.path.isfile(new_program.file_name)):
            #     os.remove(new_program.file_name)
            # if (os.path.isfile(new_program.actualout)):
            #     os.remove(new_program.actualout)
            if (os.path.isfile(new_program.inp_file)):
                os.remove(new_program.inp_file)
            if (os.path.isfile(new_program.log)):
                os.remove(new_program.log)
            if (os.path.isfile("stdin")):
                os.remove("stdin")

            return output

    except Exception, e:
        print 'Exception caught in compile phase:', str(e)
        output = '\nCompilation failed: \n\n'
        with open(new_program.log, "r") as f:
            for i in f.readlines():
                output += i
        # remove log
        # if (os.path.isfile(new_program.file_name)):
        #     os.remove(new_program.file_name)
        # if (os.path.isfile(new_program.actualout)):
        #     os.remove(new_program.actualout)
        if (os.path.isfile(new_program.inp_file)):
            os.remove(new_program.inp_file)
        if (os.path.isfile(new_program.log)):
            os.remove(new_program.log)
        if (os.path.isfile("stdin")):
            os.remove("stdin")

        return output


def readFile(fname):
    """Return the contents of the file"""
    contents = ""
    fileLocation = "./Testcases/%s" % (fname)
    if os.path.isfile(fileLocation):
        with open('./Testcases/%s' % (fname), "r") as f:
            for i in f.readlines():
                contents += i
    return contents


"""
The following snippet receives the following parameters
file: Source file which is to be executed
Lang: Source Lang
Name: Name of source program(main by default)
User: The directory where code has to be compiled and run
inp: Name of the testcase which has to be run
This file is located at / in chroot environment, it creates a file based on
above params & calls the littleChecker module that serves and compiles the code
"""


if __name__ == '__main__':
    codefile = sys.argv[1]
    lang = sys.argv[2]
    uid = sys.argv[3]
    inp = sys.argv[4]
    name = sys.argv[5]
    destination_directory = '/home/%s' % (uid)
    os.chdir(destination_directory)

    stdinContents = readFile(inp)

    # Begin creating the file and call littleChecker
    try:
        output = main(codefile, stdinContents, name)
        print output
    except Exception as e:
        print e.message
