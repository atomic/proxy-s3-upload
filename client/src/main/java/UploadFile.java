import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.mime.HttpMultipartMode;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.entity.mime.content.ContentBody;
import org.apache.http.entity.mime.content.FileBody;
import org.apache.http.entity.mime.content.StringBody;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.util.EntityUtils;

import java.io.File;


public class UploadFile {
  public static void upload() throws Exception {

    HttpClient httpclient = HttpClientBuilder.create().setUserAgent("sample-app").build();
    HttpPost   httppost   = new HttpPost("http://localhost:3000/upload");

    ContentBody contentFile = new FileBody(new File("src/hello.json"), ContentType.DEFAULT_BINARY);
    StringBody stringBody1 = new StringBody("user-x", ContentType.MULTIPART_FORM_DATA);
    StringBody stringBody2 = new StringBody("sub-folder", ContentType.MULTIPART_FORM_DATA);

    MultipartEntityBuilder builder = MultipartEntityBuilder.create();
    builder.setMode(HttpMultipartMode.BROWSER_COMPATIBLE);
    builder.addPart("text1", stringBody1);
    builder.addPart("text2", stringBody2);
    builder.addPart("userfile", contentFile);
    httppost.setEntity(builder.build());
    System.out.println("executing request " + httppost.getRequestLine());
    HttpResponse response = httpclient.execute(httppost);
    HttpEntity resEntity = response.getEntity();

    System.out.println("response: " + response.getStatusLine());
    if (resEntity != null) {
      System.out.println(EntityUtils.toString(resEntity));
    }
    if (resEntity != null) {
      resEntity.consumeContent();
    }
    httpclient.getConnectionManager().shutdown();
  }
 
  public static void main(String[] args)
  {
      try {
        UploadFile.upload();
    } catch (Exception e) {
 
        e.printStackTrace();
    }
  }
}