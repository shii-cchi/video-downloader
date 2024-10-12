package dto

type ErrorMessageDto struct {
	Pattern string   `json:"pattern"`
	Data    ErrorDto `json:"data"`
}

type ErrorDto struct {
	Error string `json:"error"`
}
