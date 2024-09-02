package main

import (
	"context"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"encoding/pem"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	oauth2Service "google.golang.org/api/oauth2/v2"
)

var googleOauthConfig *oauth2.Config
var spkiKey *rsa.PublicKey

func init() {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file")
	}

	file, err := os.Open("client_secrets.json")
	if err != nil {
		log.Fatalf("Unable to open credentials file: %v", err)
	}
	defer file.Close()

	config := struct {
		Web struct {
			ClientID     string   `json:"client_id"`
			ClientSecret string   `json:"client_secret"`
			RedirectURIs []string `json:"redirect_uris"`
		} `json:"web"`
	}{}

	if err := json.NewDecoder(file).Decode(&config); err != nil {
		log.Fatalf("Unable to parse credentials file: %v", err)
	}

	googleOauthConfig = &oauth2.Config{
		ClientID:     config.Web.ClientID,
		ClientSecret: config.Web.ClientSecret,
		RedirectURL:  config.Web.RedirectURIs[0],
		Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"},
		Endpoint:     google.Endpoint,
	}

	spkiBlock, _ := pem.Decode([]byte("-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA7d0dR+ZqVVcrCcXH2hmo\ni9+6rcWPRbWJi3RE9o9sL370Q8ZisQ7pWrQsoWOUEzpEShmuqTkKKveQQtAoEPQc\njVc9utrdBVcMT7rQ6R2MNqT04/E36w53cDdVvhr35Zo3P2xxnKCKUB0gaizE+kQK\nmPsvPRBmUX2Z0tQsy0KfyD9DLBsYp5HdqqLCEIXsXJemfqOL3D33hL8kM2hP0JIv\nX+kLw4JXM03GWt1s3dVcf++ngvMDNnkcnoRJZMeKgMMW+Q0/xw2IgcFVzzVAX1dc\nr8zGf3kdmjHmycQBus/FPDJfQf3U2XAQgssexIQ36i+HELrzDF4A639xzbjnfuEY\nfwIDAQAB\n-----END PUBLIC KEY-----\n"))
	pubInterface, _ := x509.ParsePKIXPublicKey(spkiBlock.Bytes)
	spkiKey = pubInterface.(*rsa.PublicKey)
}

func main() {
	r := gin.Default()

	store := cookie.NewStore([]byte("pM9IMt0Y25cY3Z1QRtKj7PI0b4930GZ937zUs3BX8FwVgy1aotpc7y41vVNjt5B00IRWKj3PHy68A1em9sS6orhQeX9ZVlpLfpDBwiDzkkO3ohbHwmcX1mvHFxnWYcAB"))
	r.Use(sessions.Sessions("mysession", store))

	r.GET("/auth/login", handleGoogleLogin)
	r.GET("/auth/callback", handleGoogleCallback)

	r.Run(":5050")
}

func handleGoogleLogin(c *gin.Context) {
	state := uuid.New().String()
	session := sessions.Default(c)
	session.Set("state", state)
	session.Save()

	url := googleOauthConfig.AuthCodeURL(state)
	c.Redirect(http.StatusTemporaryRedirect, url)
}

func handleGoogleCallback(c *gin.Context) {
	session := sessions.Default(c)
	retrievedState := session.Get("state")

	state := c.Query("state")
	if state != retrievedState {
		log.Println("Invalid OAuth state")
		c.Redirect(http.StatusTemporaryRedirect, "/")
		return
	}

	code := c.Query("code")
	token, err := googleOauthConfig.Exchange(context.Background(), code)
	if err != nil {
		log.Println("Code exchange failed:", err)
		c.Redirect(http.StatusTemporaryRedirect, "/")
		return
	}

	client := googleOauthConfig.Client(context.Background(), token)
	oauth2Service, err := oauth2Service.New(client)
	if err != nil {
		log.Println("Failed to create OAuth2 service:", err)
		c.Redirect(http.StatusTemporaryRedirect, "/")
		return
	}

	userInfo, err := oauth2Service.Userinfo.Get().Do()
	if err != nil {
		log.Println("Failed to get user info:", err)
		c.Redirect(http.StatusTemporaryRedirect, "/")
		return
	}

	location, err := time.LoadLocation("Asia/Bangkok")
	if err != nil {
		fmt.Println("Error loading location:", err)
		return
	}

	plaintext := []byte(fmt.Sprintf("%s_%s_%s", userInfo.Email, userInfo.Name, time.Now().In(location).Format("2006-01-02 15:04:05")))
	oaepLabel := []byte("")
	oaepDigests := sha256.New()
	ciphertext, _ := rsa.EncryptOAEP(oaepDigests, rand.Reader, spkiKey, plaintext, oaepLabel)

	encodedCiphertext := base64.URLEncoding.EncodeToString(ciphertext)

	c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("/callback?credential=%s", encodedCiphertext))
}
