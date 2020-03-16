package acmgatewaysrv;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.io.*;

@RestController
public class ACMGatewayController {
    @PostMapping("/findConflicts")
    public String findConflicts(@RequestBody String xml) {
        File tmp;
        try {
            tmp = File.createTempFile("acm-agg-", ".ggx");
            PrintWriter pw = new PrintWriter(tmp);
            pw.print(xml);
            pw.flush();

            System.out.println("Processing input model " + tmp.getAbsolutePath());
            try {
                new AGGRunner(tmp.getAbsolutePath());
            } catch(Exception e){
                System.out.println("Exception processing model " + tmp.getAbsolutePath() + ":\n");
                e.printStackTrace();
            }
            System.out.println("Processed model into " + tmp.getAbsolutePath() + "-output.ggx");

            InputStream is = new FileInputStream(tmp.getAbsolutePath() + "-output.ggx");
            BufferedReader buf = new BufferedReader(new InputStreamReader(is));
            String line = buf.readLine();
            StringBuilder sb = new StringBuilder();
            while(line != null){
                sb.append(line).append("\n");
                line = buf.readLine();
            }
            String fileAsString = sb.toString();

            return fileAsString;
        } catch (Exception e) {
            e.printStackTrace();
            return "error";
        }
    }
}