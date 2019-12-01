//package test;

import java.io.IOException;
import java.util.Enumeration;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

public class DisplayZipContents {

    public static void main(String[] args) {

        try {
            ZipFile zipFile = new ZipFile("test.zip");
            Enumeration<?> enu = zipFile.entries();
            while (enu.hasMoreElements()) {
                ZipEntry zipEntry = (ZipEntry) enu.nextElement();
                String name = zipEntry.getName();
                long size = zipEntry.getSize();
                long compressedSize = zipEntry.getCompressedSize();
                System.out.printf("name: %-20s | size: %6d | compressed size: %6d\n",
                        name, size, compressedSize);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}