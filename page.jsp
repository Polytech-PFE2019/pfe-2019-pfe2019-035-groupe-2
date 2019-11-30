<%--
  Created by IntelliJ IDEA.
  User: user
  Date: 30/11/2019
  Time: 19:40
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<%@ page language="java" %>
<html>
<form action="uploadandstore.jsp" enctype="multipart/form-data"  method="post" >

        <table border="0" bgcolor=#ccFDDEE>
            <tr>
                <td colspan="2" align="center"><B>UPLOAD THE FILE</B></td>
            </tr>
            <tr><td colspan="2" align="center"> </td></tr>
            <tr><td><b>Choose the file To Upload:</b></td>
                <td><INPUT NAME="file" TYPE="file"></td>
            </tr>
            <tr><td colspan="2" align="center"> </td></tr>
            <tr><td colspan="2" align="center"><input type="submit" value="Send File"> </td></tr>
            </table>

</form>
</html>