import AppKit
import Foundation

guard CommandLine.arguments.count == 2 else {
    fputs("Usage: render_sf_symbols.swift <output-directory>\n", stderr)
    exit(1)
}

let outputDirectory = URL(fileURLWithPath: CommandLine.arguments[1], isDirectory: true)
try FileManager.default.createDirectory(at: outputDirectory, withIntermediateDirectories: true)

let symbols: [(file: String, name: String)] = [
    ("waveform.png", "waveform"),
    ("sun.max.png", "sun.max.fill"),
    ("moon.png", "moon.fill"),
    ("apps.png", "square.grid.2x2"),
    ("shield.png", "checkmark.shield.fill"),
    ("airpods.png", "airpods"),
    ("menubar.png", "menubar.rectangle"),
    ("eq-curve.png", "waveform.path.ecg"),
    ("spectrum.png", "chart.bar.fill"),
    ("quick-actions.png", "wand.and.stars"),
    ("stereo-width.png", "arrow.left.and.right"),
    ("crossfeed.png", "headphones"),
    ("spatial.png", "dot.radiowaves.left.and.right"),
    ("dolby.png", "speaker.wave.3.fill"),
    ("auto-level.png", "dial.medium"),
    ("volume.png", "speaker.wave.3.fill"),
    ("night.png", "moon.stars.fill"),
    ("fidelity.png", "sparkles"),
    ("balance.png", "slider.horizontal.3"),
    ("power.png", "power"),
    ("preset.png", "music.note.list"),
    ("bass.png", "waveform"),
    ("save.png", "bookmark.fill")
]

func symbolImage(named name: String, pointSize: CGFloat, color: NSColor) -> NSImage? {
    guard let image = NSImage(systemSymbolName: name, accessibilityDescription: nil) else { return nil }
    let configuration = NSImage.SymbolConfiguration(pointSize: pointSize, weight: .medium)
        .applying(NSImage.SymbolConfiguration(paletteColors: [color]))
    return image.withSymbolConfiguration(configuration)
}

func pngData(for image: NSImage, canvasSize: CGFloat, inset: CGFloat = 12) -> Data? {
    let canvas = NSImage(size: NSSize(width: canvasSize, height: canvasSize))
    canvas.lockFocus()
    NSColor.clear.setFill()
    NSRect(x: 0, y: 0, width: canvasSize, height: canvasSize).fill()

    let available = canvasSize - inset * 2
    let ratio = min(available / image.size.width, available / image.size.height)
    let size = NSSize(width: image.size.width * ratio, height: image.size.height * ratio)
    let rect = NSRect(
        x: (canvasSize - size.width) / 2,
        y: (canvasSize - size.height) / 2,
        width: size.width,
        height: size.height
    )
    image.draw(in: rect)
    canvas.unlockFocus()

    guard let tiff = canvas.tiffRepresentation,
          let bitmap = NSBitmapImageRep(data: tiff) else { return nil }
    return bitmap.representation(using: .png, properties: [:])
}

for symbol in symbols {
    guard let image = symbolImage(named: symbol.name, pointSize: 52, color: .black),
          let data = pngData(for: image, canvasSize: 96) else {
        fputs("Missing SF Symbol: \(symbol.name)\n", stderr)
        exit(2)
    }
    try data.write(to: outputDirectory.appendingPathComponent(symbol.file))
}

let faviconSize: CGFloat = 128
let favicon = NSImage(size: NSSize(width: faviconSize, height: faviconSize))
favicon.lockFocus()
let backgroundRect = NSRect(x: 4, y: 4, width: 120, height: 120)
let backgroundPath = NSBezierPath(roundedRect: backgroundRect, xRadius: 28, yRadius: 28)
NSGradient(colors: [.systemBlue, .systemPurple])?.draw(in: backgroundPath, angle: 0)
if let waveform = symbolImage(named: "waveform", pointSize: 62, color: .white) {
    waveform.draw(in: NSRect(x: 29, y: 29, width: 70, height: 70))
}
favicon.unlockFocus()

if let tiff = favicon.tiffRepresentation,
   let bitmap = NSBitmapImageRep(data: tiff),
   let data = bitmap.representation(using: .png, properties: [:]) {
    try data.write(to: outputDirectory.deletingLastPathComponent().appendingPathComponent("favicon.png"))
}
