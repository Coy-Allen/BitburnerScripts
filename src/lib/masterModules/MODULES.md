
# parts
modules consist of 2 or 3 parts:
1. (optional) masterModules/lib/\<GROUP>.ts
	- Group: A grouping of modules. Used to identify what group the lib belongs too. see step 2.
	- any shared code of a group should be stored here unless there is only one module for a group, then this file is not needed.
2. masterModules/\<GROUP>/\<MODULE>.ts
	- Group: A grouping of modules. Only one module will be used per group.
	- Module: Contains module code. Should export a class with the same name as the group. The class must implement "masterModule" or extend the group's lib.
3. generators/libs/part3Requirements.ts
	- Requirements: A list of groups and modules. Is used to determine which modules to load and the priority of each module/group. Module/group will be ignored if it is not listed here.
	
# groups
hacking
	- Function: Opens ports, roots, and backdoors. Does NOT deal with scripts running on the server
	- Modules:
		+ printBackdoors: Deligates backdooring to the user. Does not require source files.
		+ singularity: Deligates backdooring to child process. Requires source file 5.
	- 
hacknet
	- Function: Purchasing hacknet nodes and servers
	- Modules:
		+ hacknet: Excludes servers.