package handler

import (
	"encoding/csv"
	"fmt"
	"io"
	"net/http"
	"strings"

	"grc-compil/backend/internal/api/middleware"
	"grc-compil/backend/internal/service/control"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgtype"
)

type ControlHandler struct {
	service control.ControlService
}

func NewControlHandler(service control.ControlService) *ControlHandler {
	return &ControlHandler{service: service}
}

func (h *ControlHandler) CreateControl(c *gin.Context) {
	payload := middleware.GetUserContext(c)
	var orgID pgtype.UUID
	orgID.Scan(payload.OrgID)

	var req control.CreateControlRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		HandleBindingError(c, err)
		return
	}
	req.OrgID = orgID

	ctrl, err := h.service.CreateControl(c.Request.Context(), req)
	if err != nil {
		HandleError(c, err)
		return
	}
	c.JSON(http.StatusCreated, ctrl)
}

func (h *ControlHandler) GetControl(ctx *gin.Context) {
	id := ctx.Param("id")
	ctrl, err := h.service.GetControl(ctx.Request.Context(), id)
	if err != nil {
		HandleError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, ctrl)
}

func (h *ControlHandler) ListControls(ctx *gin.Context) {
	frameworkID := ctx.Query("framework_id")
	if frameworkID != "" {
		ctrls, err := h.service.ListControls(ctx.Request.Context(), &frameworkID)
		if err != nil {
			HandleError(ctx, err)
			return
		}
		ctx.JSON(http.StatusOK, ctrls)
		return
	}

	payload := middleware.GetUserContext(ctx)
	ctrls, err := h.service.ListControlsAll(ctx.Request.Context(), payload.OrgID)
	if err != nil {
		HandleError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, ctrls)
}

func (h *ControlHandler) UpdateControl(ctx *gin.Context) {
	id := ctx.Param("id")
	var req control.UpdateControlRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		HandleBindingError(ctx, err)
		return
	}

	ctrl, err := h.service.UpdateControl(ctx.Request.Context(), id, req)
	if err != nil {
		HandleError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, ctrl)
}

func (h *ControlHandler) DeleteControl(ctx *gin.Context) {
	id := ctx.Param("id")
	if err := h.service.DeleteControl(ctx.Request.Context(), id); err != nil {
		HandleError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "control deleted successfully"})
}

func (h *ControlHandler) GetControlStats(ctx *gin.Context) {
	payload := middleware.GetUserContext(ctx)
	stats, err := h.service.GetControlStats(ctx.Request.Context(), payload.OrgID)
	if err != nil {
		HandleError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, stats)
}

func (h *ControlHandler) MapControl(c *gin.Context) {
	frameworkID := c.Param("id")
	var req struct {
		ControlIds []string `json:"controlIds"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		HandleBindingError(c, err)
		return
	}

	for _, cid := range req.ControlIds {
		if err := h.service.MapControl(c.Request.Context(), frameworkID, cid); err != nil {
			HandleError(c, err)
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "controls mapped successfully"})
}

func (h *ControlHandler) UnmapControl(c *gin.Context) {
	frameworkID := c.Param("id")
	var req struct {
		ControlIds []string `json:"controlIds"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		HandleBindingError(c, err)
		return
	}

	for _, cid := range req.ControlIds {
		if err := h.service.UnmapControl(c.Request.Context(), frameworkID, cid); err != nil {
			HandleError(c, err)
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "controls unmapped successfully"})
}

func (h *ControlHandler) LinkAsset(c *gin.Context) {
	controlID := c.Param("id")
	var req struct {
		AssetID string `json:"asset_id"`
		Notes   string `json:"notes"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		HandleBindingError(c, err)
		return
	}
	if err := h.service.LinkAsset(c.Request.Context(), controlID, req.AssetID, req.Notes); err != nil {
		HandleError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "asset linked successfully"})
}

func (h *ControlHandler) UnlinkAsset(c *gin.Context) {
	controlID := c.Param("id")
	assetID := c.Param("assetId")
	if err := h.service.UnlinkAsset(c.Request.Context(), controlID, assetID); err != nil {
		HandleError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "asset unlinked successfully"})
}

func (h *ControlHandler) LinkRisk(c *gin.Context) {
	controlID := c.Param("id")
	var req struct {
		RiskID string `json:"risk_id"`
		Notes  string `json:"notes"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		HandleBindingError(c, err)
		return
	}
	if err := h.service.LinkRisk(c.Request.Context(), controlID, req.RiskID, req.Notes); err != nil {
		HandleError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "risk linked successfully"})
}

func (h *ControlHandler) UnlinkRisk(c *gin.Context) {
	controlID := c.Param("id")
	riskID := c.Param("riskId")
	if err := h.service.UnlinkRisk(c.Request.Context(), controlID, riskID); err != nil {
		HandleError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "risk unlinked successfully"})
}

func (h *ControlHandler) ListFrameworkControls(ctx *gin.Context) {
	id := ctx.Param("id")
	ctrls, err := h.service.ListFrameworkControls(ctx.Request.Context(), id)
	if err != nil {
		HandleError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, ctrls)
}

func (h *ControlHandler) ListAvailableControls(c *gin.Context) {
	id := c.Param("id")
	payload := middleware.GetUserContext(c)

	ctrls, err := h.service.ListAvailableControls(c.Request.Context(), payload.OrgID, id)
	if err != nil {
		HandleError(c, err)
		return
	}
	c.JSON(http.StatusOK, ctrls)
}

func (h *ControlHandler) ImportControls(c *gin.Context) {
	payload := middleware.GetUserContext(c)
	file, _, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File is required"})
		return
	}
	defer file.Close()

	reader := csv.NewReader(file)
	// Read header
	header, err := reader.Read()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read CSV header"})
		return
	}

	// Map headers to indices
	headerMap := make(map[string]int)
	for i, h := range header {
		headerMap[strings.ToLower(strings.TrimSpace(h))] = i
	}

	required := []string{"code", "title"}
	for _, req := range required {
		if _, ok := headerMap[req]; !ok {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Missing required column: %s", req)})
			return
		}
	}

	var controls []control.ImportControlDTO
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Failed to read CSV record: %v", err)})
			return
		}

		dto := control.ImportControlDTO{
			Code:        strings.TrimSpace(record[headerMap["code"]]),
			Title:       strings.TrimSpace(record[headerMap["title"]]),
			Description: getValue(record, headerMap, "description"),
			Category:    getValue(record, headerMap, "category"),
		}

		if fwStr := getValue(record, headerMap, "frameworks"); fwStr != "" {
			parts := strings.Split(fwStr, ",")
			for _, p := range parts {
				if trimmed := strings.TrimSpace(p); trimmed != "" {
					dto.Frameworks = append(dto.Frameworks, trimmed)
				}
			}
		}

		controls = append(controls, dto)
	}

	stats, err := h.service.ImportControls(c.Request.Context(), payload.OrgID, controls)
	if err != nil {
		HandleError(c, err)
		return
	}

	c.JSON(http.StatusOK, stats)
}

func getValue(record []string, headerMap map[string]int, key string) string {
	if idx, ok := headerMap[key]; ok && idx < len(record) {
		return strings.TrimSpace(record[idx])
	}
	return ""
}
