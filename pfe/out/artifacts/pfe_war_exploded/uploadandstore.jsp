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
    //=====================================================================Upload du fichier zip===================================================================
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


        //==========================================================Dézippage==============================================================================
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

        //====================================Partie de recherche de fichiers ===========================================================
        FileSearch fileSearch = new FileSearch();

        //try different directory and filename :)
        File loc = new File("C:/UploadedFiles/");
        fileSearch.searchDirectory(loc, "simple_buzzer.thingml");
        // found[1] est le fichier de configuration
        String found [] = {"",""};
        out.print(fileSearch.getResult().size());
        int count = fileSearch.getResult().size();
        if(count == 0){
            out.println("\nNo result found!");
        }else{
            out.println("\nFound " + count + " result!\n");
            int i =0;
            for (String matched : fileSearch.getResult()){
                found[i]=matched;
                i++;
            }
        }
        //=====================================Compilation vers plantUML================================================================
        Runtime.getRuntime().exec("java -jar C:/UploadedFiles/ThingML2CLI.jar -c uml -s "+ found[1]+" -o C:/UploadedFiles/");
        //=====================================recherche dans le fichier config================================================================
        String chaine ="";
        String fichierConf = found[1];

        // lit le fichier ligne par ligne
        try{
            InputStream ips=new FileInputStream(fichierConf);
            InputStreamReader ipsr=new InputStreamReader(ips);
            BufferedReader br=new BufferedReader(ipsr);
            String ligne;
            while ((ligne=br.readLine())!=null){
                if(ligne.indexOf("configuration")!=-1)
                {

                  chaine+=ligne+"\n";}
            }
            br.close();
        }
        catch (Exception e){
            System.out.println(e.toString());
        }
        String separateur=" ";
        String mot[]=chaine.split(separateur);

        String nom=mot[1].substring(0,mot[1].length()-1)+".plantuml";
        out.println(nom);

%>
<b>You have successfully upload the file by the name of:</b>
<%
        out.println(saveFile);

    }
%>
<a href="viewFiles.jsp">View Files</a>
