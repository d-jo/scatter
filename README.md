# Scatter

Scatter is a message distribution system that fragments data and keeps track of how to reconstruct it.

Scatter uses manifest files to point to fragmented data across the web or in a local index. The data is either passive or active. Passive data includes data on the web not hosted by either party, or the local index. Active data is deliberately posted to the web. Active data could be fourm posts, pastebins, steganography or any other way data can be hosted. 

It's normal to create a manifest file that constructs a new manifest file when decoded. A layered approach is useful for files that require the fragment locations to change often, or have many fragments. Depending on the content, a layered message produces a smaller manifest file for distribution.

Some fun ideas for data: steganography,  

```
======== 			File
== == == == 		Fragments
= = = = = = = = 	Sections
```
