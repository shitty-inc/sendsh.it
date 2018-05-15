package main

import (
	"bytes"
	"encoding/json"
	"github.com/akrylysov/algnhsa"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	"github.com/teris-io/shortid"
	"io/ioutil"
	"net/http"
	"os"
	"time"
)

// ErrorResponse response object
type ErrorResponse struct {
	Error string `json:"error"`
}

// UploadResponse response object
type UploadResponse struct {
	Id string `json:"id"`
}

/**
 * Download a file from s3 and then delete it.
 */
func downloadHandler(writer http.ResponseWriter, request *http.Request) {
	id := request.URL.Query().Get("id")
	if id == "" {
		returnErrorStatus(writer, http.StatusNotFound)
		return
	}

    sess, _ := session.NewSession(&aws.Config{
        Region: aws.String(os.Getenv("REGION"))},
    )

    svc := s3.New(sess)

	result, err := svc.GetObject(&s3.GetObjectInput{
		Bucket: aws.String(os.Getenv("BUCKET")),
		Key:    aws.String(id),
	})

	if err != nil {
		returnErrorStatus(writer, http.StatusNotFound)
		return
	}

	buff, buffErr := ioutil.ReadAll(result.Body)

	if buffErr != nil {
		returnErrorStatus(writer, http.StatusInternalServerError)
		return
	}

	// Fix file name

	reader := bytes.NewReader(buff)
	http.ServeContent(writer, request, "file", time.Now(), reader)

	_, err = svc.DeleteObject(&s3.DeleteObjectInput{
        Bucket: aws.String(os.Getenv("BUCKET")),
        Key:    aws.String(id),
    })

	return
}

/**
 * Store an uploaded file in S3.
 */
func uploadHandler(writer http.ResponseWriter, request *http.Request) {
	request.ParseMultipartForm(32 << 20)
	slug, err := shortid.Generate()
	file, _, err := request.FormFile("upload")

	// Limit upload size

	if err != nil {
		returnErrorStatus(writer, http.StatusInternalServerError)
		return
	}

	sess := session.Must(session.NewSession())
	uploader := s3manager.NewUploader(sess)

	_, uploadErr := uploader.Upload(&s3manager.UploadInput{
		Bucket: aws.String(os.Getenv("BUCKET")),
		Key:    aws.String(slug),
		Body:   file,
	})

	if uploadErr != nil {
		returnErrorStatus(writer, http.StatusInternalServerError)
		return
	}

	response := UploadResponse{
		Id: slug,
	}

	returnJson(writer, response)
}

/**
 * Return a json error status.
 */
func returnErrorStatus(writer http.ResponseWriter, status int) {
	response := ErrorResponse{
		Error: http.StatusText(status),
	}

	writer.WriteHeader(status)
	returnJson(writer, response)
}

/**
 * Return json
 */
func returnJson(writer http.ResponseWriter, response interface{}) {
	writer.Header().Set("Content-Type", "application/json")
	writer.Header().Set("Access-Control-Allow-Origin", "*")
	json.NewEncoder(writer).Encode(response)
}

/**
 * Main handler function
 */
func main() {
	http.HandleFunc("/download", downloadHandler)
	http.HandleFunc("/upload", uploadHandler)

	algnhsa.ListenAndServe(http.DefaultServeMux, nil)
}
