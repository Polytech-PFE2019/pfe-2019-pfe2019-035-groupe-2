<%@ page import="java.io.File" %>
<%@ page import="java.io.FilenameFilter" %>
<%@ page import="file.FileSearch" %><%--
  Created by IntelliJ IDEA.
  User: Reaps
  Date: 01/12/2019
  Time: 17:19
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>Title</title>
</head>
<body>
    Here are the results :
</body>
</html>
<%


    FileSearch fileSearch = new FileSearch();

    //try different directory and filename :)
     File loc = new File("C:/Users/Reaps/Desktop/test");
    fileSearch.searchDirectory(loc, "config.txt");

    out.print(fileSearch.getResult().size());
    int count = fileSearch.getResult().size();
    if(count == 0){
        out.println("\nNo result found!");
    }else{
        out.println("\nFound " + count + " result!\n");
        for (String matched : fileSearch.getResult()){
        out.println("Found : " + matched);
    }



}
%>
