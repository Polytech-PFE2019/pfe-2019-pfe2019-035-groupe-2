<%--
  Created by IntelliJ IDEA.
  User: user
  Date: 30/11/2019
  Time: 19:43
  To change this template use File | Settings | File Templates.
--%>

<%@page import="java.io.*, java.sql.*"%>
<%@ page import="java.util.zip.ZipFile" %>
<%@ page import="java.util.zip.ZipEntry" %>
<%@ page import="java.util.Enumeration" %>
<%@ page import="java.nio.file.Files" %>
<%@ page import="java.nio.file.Paths" %>
<%@ page import="file.FileSearch" %>


<%

    String saveFile="";
    String contentType = request.getContentType();
    if ((contentType != null) && (contentType.contains("multipart/form-data"))) {
        DataInputStream in = new DataInputStream(request.getInputStream());
        int formDataLength = request.getContentLength();
        byte dataBytes[] = new byte[formDataLength];
        int byteRead = 0;
        int totalBytesRead = 0;
        while (totalBytesRead < formDataLength) {
            byteRead = in.read(dataBytes, totalBytesRead, formDataLength);
            totalBytesRead += byteRead;
        }
        String file = new String(dataBytes);
        saveFile = file.substring(file.indexOf("filename=\"") + 10);
        saveFile = saveFile.substring(0, saveFile.indexOf("\n"));
        saveFile = saveFile.substring(saveFile.lastIndexOf("\\") + 1, saveFile.indexOf("\""));
        int lastIndex = contentType.lastIndexOf("=");
        String boundary = contentType.substring(lastIndex + 1, contentType.length());
        int pos;
        pos = file.indexOf("filename=\"");
        pos = file.indexOf("\n", pos) + 1;
        pos = file.indexOf("\n", pos) + 1;
        pos = file.indexOf("\n", pos) + 1;
        int boundaryLocation = file.indexOf(boundary, pos) - 4;
        int startPos = ((file.substring(0, pos)).getBytes()).length;
        int endPos = ((file.substring(0, boundaryLocation)).getBytes()).length;
        saveFile = "C:/UploadedFiles/" + saveFile;
        File f = new File(saveFile);
        FileOutputStream fileOut = new FileOutputStream(f);
        fileOut.write(dataBytes, startPos, (endPos - startPos));
        fileOut.flush();
        fileOut.close();


        /*try {
            new ZipFile("hh.zip").extractAll("C:/UploadedFiles");
        } catch (ZipException e) {
            e.printStackTrace();
        }*/

        //unzip(saveFile, "C:/UploadedFiles");
        ZipFile zipFile = new ZipFile(saveFile);




        Enumeration<? extends ZipEntry> entries = zipFile.entries();

        while (entries.hasMoreElements()) {
            ZipEntry entry = entries.nextElement();

            String destPath = "C:/UploadedFiles/" + File.separator + entry.getName();
            if(destPath.indexOf('.')==-1){
                File ff = new File(destPath);
                ff.mkdir();
            }
            else {
                System.out.println(" => " + destPath);
                InputStream is = zipFile.getInputStream(entry);
                Files.copy(is, Paths.get(destPath));
            }

        }

        //====================================Partie de recherche de fichiers ================================
        FileSearch fileSearch = new FileSearch();

        //try different directory and filename :)
        File loc = new File("C:/UploadedFiles/");
        fileSearch.searchDirectory(loc, "fin.txt");

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
<b>You have successfully upload the file by the name of:</b>
<%
        out.println(saveFile);

    }
%>
<a href="viewFiles.jsp">View Files</a>
