NIT J CSE 2013-17 Final Year Project 
---

---

To make a local compiler for languages like C,C++,Java and Python hosted on a server so that we
can access, compile and debug the code anywhere in the college/university.


#### Front End  ####
* Using twitter Bootstrap, jQuery, jQueryUI and custom CSS wherever necessary.
* Editor support is mirrored by CodeMirror UI library.
* Shell UI support is provided by GateOne
* Tabbed editor support using custom CSS

#### Back End ####
* Chroot Jail environment running on a Linux Server System with support for Django and encrypted users.
* *Paramiko* library for providing SSH and SFTP support for the underlying network.
* Python scripts that compile and test the execution.

#### Server side implementation ####
![image](https://user-images.githubusercontent.com/12872673/41510494-454ac520-7283-11e8-91db-369d2c0110a4.png)

#### Project flowchart ####
![image](https://user-images.githubusercontent.com/12872673/41510507-6bfea344-7283-11e8-979f-7e6317fdd1ac.png)


#### UI Screens ####
---
![Workspace view](https://user-images.githubusercontent.com/12872673/41510510-8075ced8-7283-11e8-991c-7c7950e6e660.png)
---
![Editor view](https://user-images.githubusercontent.com/12872673/41510516-a9d0438a-7283-11e8-99a2-5fc5960b2719.png)
---
![Editor features](https://user-images.githubusercontent.com/12872673/41510520-c5253f82-7283-11e8-8a48-d942631c2090.png)


### Design Challenges Addressed ### 

1) Restricting the user to a specific directory so that all malicious code and vulnerabilities remain contained
 
```
Implement a  Chroot jail at the backend for user isolation. 
Make separate directories per user.
```


2) Handling timeouts and memory issues for the user programs.

```
Run the program as a separate process and issue 
SIGINT/SIGTERM handlers followed by KILL command
```

3) Securely sending the user submitted program from the Django realm to the backend.

```
Used Paramiko library for providing SSH and SFTP support for the underlying network.
```

4) Implementing a command line shell within the user workspace so that he can compile and build programs
```
 Used Gate One which is a web-based Terminal Emulator and SSH client that brings the power of the command line to the web
```

5) Limiting memory used by the running process

```
 Use Linux's built in setrlimit and ulimit utilities
(Partially working because ulimit is not reliable)
```

6) Preventing malicious user programs such as a fork bomb

```
We limited the number of sub processes a parent can create. We appended the following lines to /etc/security/limits.conf per user
		<user> hard nproc 20
       This restricted the number of child processes to 20
```
